defmodule ShowMeTheCode.Room.Bucket do
  use Agent

  alias ShowMeTheCode.Room.State, as: State
  alias ShowMeTheCode.User, as: User

  def start_link do
    Agent.start_link(fn -> %State{} end, name: __MODULE__)
  end

  def join(room, user_id, user_name) do
    Agent.get_and_update(room, fn state ->
      if length(state.colors) === 0, do: {nil, state}

      [color | rest] = state.colors
      user = %User{name: user_name, id: user_id, color: color}
      users = Map.put(state.users, user_id, user)

      {user, %State{users: users, colors: rest}}
    end)
  end

  def leave(room, user_id) do
    Agent.update(room, &Map.delete(&1, user_id))
  end
end
