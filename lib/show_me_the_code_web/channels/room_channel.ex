defmodule ShowMeTheCodeWeb.RoomChannel do
  use Phoenix.Channel

  alias ShowMeTheCode.{User, Repo, Room}
  alias ShowMeTheCode.Room.{Registry, Bucket, Watcher, Presence}

  def join("room:" <> room_id, _payload, socket) do
    try do
      if !String.match?(
        room_id,
        ~r/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      ) do
        throw(:invalid_room_id)
      end

      room = Repo.get(ShowMeTheCode.Room, room_id)
      if room == nil, do: throw(:room_not_exist)
      room_bucket = Registry.get_or_create(Registry, room_id)
      slot = Bucket.join(room_bucket, socket.assigns.id, self())
      if slot == nil, do: throw(:room_full)

      socket =
        socket
        |> assign(:room_id, room_id)
        |> assign(:room, room_bucket)
        |> assign(:slot, slot)

      Watcher.monitor(socket)
      user = User.from_socket(socket)
      send(self(), {:after_join, user, room})
      {:ok, %{userId: user.id}, socket}
    catch
      :invalid_room_id -> {:error, %{:reason => "invalid room id"}}
      :room_not_exist -> {:error, %{:reason => "room not exist"}}
      :room_full -> {:error, %{:reason => "room is full"}}
    end
  end

  def handle_in(
        "sync.full.reply",
        %{"content" => content, "language" => language, "expires" => expires},
        socket
      ) do
    broadcast(socket, "sync.full", %{content: content, language: language, expires: expires})
    {:noreply, socket}
  end

  def handle_in("user.edit", payload, socket) do
    broadcast_from(socket, "user.edit", Map.put(payload, "from", socket.assigns.id))
    {:noreply, socket}
  end

  def handle_in("user.selection", payload, socket) do
    broadcast_from(socket, "user.selection", Map.put(payload, "from", socket.assigns.id))
    {:noreply, socket}
  end

  def handle_in("user.cursor", payload, socket) do
    broadcast_from(socket, "user.cursor", Map.put(payload, "from", socket.assigns.id))
    {:noreply, socket}
  end

  def handle_in("save", %{"content" => content, "language" => language}, socket) do
    {status, _} =
      %Room{id: socket.assigns.room_id}
      |> Room.changeset(%{content: content, language: language})
      |> Repo.update()

    {:reply, status, socket}
  end

  def handle_info({:after_join, user, room}, socket) do
    user_list = Presence.list(socket)
    push(socket, "presence_state", user_list)
    user_count = map_size(user_list)

    result =
      if user_count > 0 do
        {target_user_id, _} = Enum.at(user_list, 0)
        send_to_user(target_user_id, {:sync_full_request, %{from: user.id}}, socket)
      end

    if user_count == 0 or result != :ok do
      push(socket, "sync.full", Map.take(room, [:content, :language, :expires]))
    end

    {:ok, _} = Presence.track(socket, socket.assigns.id, user)
    {:noreply, socket}
  end

  def handle_info({:sync_full_request, payload}, socket) do
    push(socket, "sync.full.request", payload)
    {:noreply, socket}
  end

  defp send_to_user(user_id, payload, socket) do
    clients = Bucket.get_clients(socket.assigns.room)
    channel_pid = Map.get(clients, user_id)

    if channel_pid != nil do
      send(channel_pid, payload)
      :ok
    else
      :error
    end
  end
end
