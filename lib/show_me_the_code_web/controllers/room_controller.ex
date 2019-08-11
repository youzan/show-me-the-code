defmodule ShowMeTheCodeWeb.RoomController do
  use ShowMeTheCodeWeb, :controller
  alias ShowMeTheCode.{Repo, Room}

  def create_one(conn, _params) do
    json(conn, "")
  end

  def create_many(conn, _params) do
    json(conn, %{})
  end
end
