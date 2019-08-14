defmodule ShowMeTheCodeWeb.RoomChannel do
  use Phoenix.Channel

  alias ShowMeTheCodeWeb.Endpoint
  alias ShowMeTheCode.User
  alias ShowMeTheCode.Room.{Registry, Bucket, Watcher, Presence}

  def join("room:" <> room_id, _payload, socket) do
    try do
      if !String.match?(
           room_id,
           ~r/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
         ) do
        throw(:invalid_room_id)
      end

      room = ShowMeTheCode.Repo.get(ShowMeTheCode.Room, room_id)
      if room == nil, do: throw(:room_not_exist)
      room_bucket = Registry.get_or_create(Registry, room_id)
      slot = Bucket.join(room_bucket)
      if slot == nil, do: throw(:room_full)
      Watcher.monitor(socket)

      socket =
        socket |> assign(:room_id, room_id) |> assign(:room, room_bucket) |> assign(:slot, slot)

      user = User.from_socket(socket)
      send(self(), {:after_join, user, room})
      {:ok, %{userId: user.id}, socket}
    catch
      :invalid_room_id -> {:error, %{:reason => "invalid room id"}}
      :room_not_exist -> {:error, %{:reason => "room not exist"}}
      :room_full -> {:error, %{:reason => "room is full"}}
    end
  end

  def handle_info({:after_join, user, room}, socket) do
    user_list = Presence.list(socket)
    push(socket, "presence_state", user_list)

    if map_size(user_list) == 0 do
      push(socket, "sync.reply", Map.take(room, [:content, :language, :expires]))
    end

    {:ok, _} = Presence.track(socket, socket.assigns.id, user)
    {:noreply, socket}
  end

  # def handle_info({:sync_from_client, user}, socket) do
  #   socket.endpoint.broadcast("user_socket:#{user.id}", "sync.request", %{
  #     from: socket.assigns.id
  #   })

  #   {:noreply, socket}
  # end
end
