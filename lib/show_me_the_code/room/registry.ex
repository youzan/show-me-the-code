defmodule ShowMeTheCode.Room.Registry do
  use GenServer

  def start_link(opts) do
    GenServer.start_link(__MODULE__, :ok, opts)
  end

  @impl true
  def init(:ok) do
    {:ok, %{}}
  end

  @impl true
  def handle_call({:get_or_create, room_id}, _from, rooms) do
    if Map.has_key?(rooms, room_id) do
      {:reply, Map.fetch(rooms, room_id), rooms}
    else
      {:ok, room} = ShowMeTheCode.Room.Bucket.start_link()
      {:reply, room, Map.put(rooms, room_id, room)}
    end
  end

  def get_or_create(registry, room_id) do
    GenServer.call(registry, {:get_or_create, room_id})
  end
end
