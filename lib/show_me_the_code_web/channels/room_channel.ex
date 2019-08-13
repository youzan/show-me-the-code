defmodule ShowMeTheCodeWeb.RoomChannel do
  use Phoenix.Channel

  alias ShowMeTheCode.Room.{Registry, Bucket, Watcher}

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

      user =
        case Bucket.join(
               room_bucket,
               socket.assigns.id,
               socket.assigns.username
             ) do
          {:ok, user} -> user
          {:error, :room_full} -> throw(:room_full)
        end

      Watcher.monitor(socket.channel_pid, room_bucket, user.id, room_id)

      socket = socket |> assign(:user, user) |> assign(:room, room_bucket)

      user_list = Bucket.get_user_list(room_bucket)

      send(self(), :after_join)

      {:ok, %{users: user_list, userId: socket.assigns.id}, socket}
    catch
      :invalid_room_id -> {:error, %{:reason => "invalid room id"}}
      :room_not_exist -> {:error, %{:reason => "room not exist"}}
      :room_full -> {:error, %{:reason => "room is full"}}
    end
  end

  def handle_info(:after_join, socket) do
    broadcast!(socket, "user.join", socket.assigns.user)
    {:noreply, socket}
  end
end
