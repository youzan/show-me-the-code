defmodule ShowMeTheCodeWeb.RoomChannel do
  use Phoenix.Channel

  alias ShowMeTheCode.User
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

      socket =
        case Bucket.join(room_bucket, socket) do
          {:ok, socket} -> socket
          {:error, :room_full} -> throw(:room_full)
        end

      socket = socket |> assign(:room, room_bucket) |> assign(:room_id, room_id)
      Watcher.monitor(socket)
      clients = Bucket.get_clients(room_bucket)
      user_list = Enum.map(clients, fn {_, client} -> User.from_socket(client) end)
      send(self(), :after_join)
      {:ok, %{users: user_list, userId: socket.assigns.id}, socket}
    catch
      :invalid_room_id -> {:error, %{:reason => "invalid room id"}}
      :room_not_exist -> {:error, %{:reason => "room not exist"}}
      :room_full -> {:error, %{:reason => "room is full"}}
    end
  end

  def handle_info(:after_join, socket) do
    user = User.from_socket(socket)
    broadcast!(socket, "user.join", user)
    {:noreply, socket}
  end
end
