defmodule ShowMeTheCode.Room.Watcher do
  use GenServer

  alias ShowMeTheCode.Room.{Registry, Bucket}

  def start_link(_) do
    GenServer.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  @impl true
  def init(:ok) do
    {:ok, %{}}
  end

  @impl true
  def handle_cast({:monitor, channel_pid, room_pid, user_id}, state) do
    ref = Process.monitor(channel_pid)
    state = Map.put(state, ref, {room_pid, user_id})
    {:noreply, state}
  end

  @impl true
  def handle_info({:DOWN, ref, :process, _pid, _reason}, state) do
    {{room_pid, user_id}, state} = Map.pop(state, ref)
    Bucket.leave(room_pid, user_id)
    {:noreply, state}
  end

  @impl true
  def handle_info(_msg, state) do
    {:noreply, state}
  end

  def monitor(channel_pid, room_pid, user_id) do
    GenServer.cast(__MODULE__, {:monitor, channel_pid, room_pid, user_id})
  end
end
