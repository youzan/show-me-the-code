defmodule ShowMeTheCode.Room.Bucket do
  use Agent

  alias Phoenix.Socket
  alias ShowMeTheCode.Room.State
  alias ShowMeTheCode.User

  def start_link(_opts) do
    Agent.start_link(fn -> %State{} end)
  end

  def join(room) do
    Agent.get_and_update(room, fn state ->
      try do
        if length(state.slots) === 0, do: throw({:room_full})
        [slot | rest] = state.slots
        {slot, %State{slots: rest}}
      catch
        {:room_full} -> {nil, state}
      end
    end)
  end

  def leave(room, slot) do
    Agent.update(room, fn state ->
      %State{slots: [slot | state.slots]}
    end)
  end
end
