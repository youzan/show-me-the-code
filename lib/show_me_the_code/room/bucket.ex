defmodule ShowMeTheCode.Room.Bucket do
  use Agent

  alias Phoenix.Socket
  alias ShowMeTheCode.Room.State
  alias ShowMeTheCode.User

  def start_link(_opts) do
    Agent.start_link(fn -> %State{} end)
  end

  def join(room, socket) do
    Agent.get_and_update(room, fn state ->
      try do
        if length(state.slots) === 0, do: throw({:room_full})
        [slot | rest] = state.slots
        socket = Socket.assign(socket, :slot, slot)
        clients = Map.put(state.clients, socket.assigns.id, socket)
        {{:ok, socket}, %State{clients: clients, slots: rest}}
      catch
        {:room_full} -> {{:error, :room_full}, state}
      end
    end)
  end

  def leave(room, user_id) do
    Agent.update(room, fn state ->
      {socket, clients} = Map.pop(state.clients, user_id)
      %State{clients: clients, slots: [socket.assigns.slot | state.slots]}
    end)
  end

  def get_clients(room) do
    %State{clients: clients} = Agent.get(room, & &1)
    clients
  end
end
