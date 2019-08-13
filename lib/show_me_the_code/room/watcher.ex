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
    state = Map.put(state, ref, socket)
    {:noreply, state}
  end

  @impl true
  def handle_info({:DOWN, ref, :process, _pid, _reason}, state) do
    {socket, state} = Map.pop(state, ref)
    user_id = socket.assigns.id
    Bucket.leave(socket.assigns.room, user_id)

    ShowMeTheCodeWeb.Endpoint.broadcast("room:#{socket.assigns.room_id}", "user.leave", %{
      user: user_id
    })

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
