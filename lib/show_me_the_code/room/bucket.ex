defmodule ShowMeTheCode.Room.Bucket do
  use Agent

  alias ShowMeTheCode.Room.State
  alias ShowMeTheCode.User

  def start_link(_opts) do
    Agent.start_link(fn -> %State{} end)
  end

  def join(room, user_id, user_name) do
    Agent.get_and_update(room, fn state ->
      try do
        if length(state.slots) === 0, do: throw({:room_full})

        [slot | rest] = state.slots
        user = %User{name: user_name, id: user_id, slot: slot}
        users = Map.put(state.users, user_id, user)

        {{:ok, user}, %State{users: users, slots: rest}}
      catch
        {:room_full} -> {{:error, :room_full}, state}
      end
    end)
  end

  def leave(room, user_id) do
    IO.inspect(user_id)

    Agent.update(room, fn state ->
      {%User{slot: slot}, users} = Map.pop(state.users, user_id)
      %State{users: users, slots: [slot | state.slots]}
    end)
  end

  def get_user_list(room) do
    %State{users: users} = Agent.get(room, & &1)
    Enum.map(users, fn {_, user} -> user end)
  end
end
