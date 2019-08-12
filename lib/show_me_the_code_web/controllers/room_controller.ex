defmodule ShowMeTheCodeWeb.RoomController do
  use ShowMeTheCodeWeb, :controller
  alias ShowMeTheCode.{Repo, Room}
  alias Ecto.Multi

  def create_one(conn, params) do
    expires = params[:expires]
    {:ok, room} = Repo.insert(%Room{expires: expires})
    json(conn, %{:response => room.id})
  end

  def create_many(conn, %{"amount" => amount} = params) do
    expires = params[:expires]

    multi =
      Enum.reduce(1..amount, Multi.new(), fn index, multi ->
        Multi.insert(multi, index, %Room{expires: expires})
      end)

    {:ok, result} = Repo.transaction(multi)
    response = Enum.map(result, fn {_, value} -> value.id end)
    json(conn, %{:response => response})
  end
end
