defmodule ShowMeTheCode.Room.Watcher do
  use GenServer

  alias ShowMeTheCode.Room.Bucket

  def start_link(_) do
    GenServer.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  @impl true
  def init(:ok) do
    {:ok, %{}}
  end

  @impl true
  def handle_cast({:monitor, socket}, state) do
    ref = Process.monitor(socket.channel_pid)
    state = Map.put(state, ref, {socket.assigns.room, socket.assigns.slot})
    {:noreply, state}
  end

  @impl true
  def handle_info({:DOWN, ref, :process, _pid, _reason}, state) do
    {{room, slot}, state} = Map.pop(state, ref)
    Bucket.leave(room, slot)
    {:noreply, state}
  end

  @impl true
  def handle_info(_msg, state) do
    {:noreply, state}
  end

  def monitor(socket) do
    GenServer.cast(__MODULE__, {:monitor, socket})
  end
end
