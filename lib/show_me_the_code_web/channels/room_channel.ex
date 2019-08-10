defmodule ShowMeTheCodeWeb.RoomChannel do
  use Phoenix.Channel

  alias ShowMeTheCode.Room.Registry, as: Registry
  alias ShowMeTheCode.Room.Bucket, as: Bucket

  def join("room:" <> room_id, payload, socket) do
    try do
      if !String.match?(
           room_id,
           ~r/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
         ) do
        throw({:invalid_room_id})
      end

      room = ShowMeTheCode.Repo.get(ShowMeTheCode.Room, room_id)

      if room == nil, do: throw({:room_not_exist})

      room_bucket = Registry.get_or_create(Registry, room_id)

      user =
        Bucket.join(
          room_bucket,
          socket.assigns[:id],
          Map.get(payload, "username")
        )

      socket = socket |> assign(:user, user) |> assign(:room, room_bucket)

      {:ok, socket}
    catch
      {:invalid_room_id} -> {:error, %{ :reason => "invalid room id" }}
      {:room_not_exist} -> {:error, %{ :reason => "room not exist"}}
    end
  end
end
