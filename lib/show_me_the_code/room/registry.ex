defmodule ShowMeTheCode.Room.Registry do
  use GenServer

  alias ShowMeTheCode.Room.Bucket

  def start_link(opts) do
    GenServer.start_link(__MODULE__, :ok, opts)
  end

  @impl true
  def init(:ok) do
    {:ok, {%{}, %{}}}
  end

  @impl true
  def handle_call({:get_or_create, room_id}, _from, {rooms, refs}) do
    room = Map.get(rooms, room_id)

    if room != nil do
      {:reply, room, {rooms, refs}}
    else
      {:ok, room} = DynamicSupervisor.start_child(ShowMeTheCode.Room.Supervisor, Bucket)

      ref = Process.monitor(room)
      {:reply, room, {Map.put(rooms, room_id, room), Map.put(refs, ref, room_id)}}
    end
  end

  @impl true
  def handle_cast({:DOWN, ref, :process, _pid, _reason}, {rooms, refs}) do
    {room_id, refs} = Map.pop(refs, ref)
    rooms = Map.delete(rooms, room_id)
    {:noreply, {rooms, refs}}
  end

  @impl true
  def handle_info(_msg, state) do
    {:noreply, state}
  end

  def get_or_create(registry, room_id) do
    GenServer.call(registry, {:get_or_create, room_id})
  end
end
