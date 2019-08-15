defmodule ShowMeTheCode.Room.Bucket do
  use Agent

  alias ShowMeTheCode.Room.State

  def start_link(_opts) do
    Agent.start_link(fn -> %State{} end)
  end

  def join(room, user_id, channel_pid) do
    Agent.get_and_update(room, fn state ->
      try do
        if length(state.slots) === 0, do: throw({:room_full})
        [slot | rest] = state.slots
        {slot, %State{slots: rest, clients: Map.put(state.clients, user_id, channel_pid)}}
      catch
        {:room_full} -> {nil, state}
      end
    end)
  end

  def leave(room, slot, user_id) do
    Agent.update(room, fn state ->
      %State{slots: [slot | state.slots], clients: Map.delete(state.clients, user_id)}
    end)
  end

  def get_clients(room) do
    Agent.get(room, fn state -> state.clients end)
  end
end
