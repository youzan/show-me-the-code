defmodule ShowMeTheCodeWeb.RoomController do
  use ShowMeTheCodeWeb, :controller
  alias ShowMeTheCode.{Repo, Room}

  def create_one(conn, params) do
    expires = params[:expires]
    {:ok, room} = Repo.insert(%Room{expires: expires})
    json(conn, %{:response => room.id})
  end

  def create_many(conn, %{"amount" => amount} = params) do
    expires = params[:expires]

    list =
      List.duplicate(
        [expires: expires],
        amount
      )

    {_count, returns} = Repo.insert_all(Room, list)
    IO.inspect(returns)
    json(conn, %{:response => ""})
  end
end
