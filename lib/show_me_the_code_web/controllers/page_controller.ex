defmodule ShowMeTheCodeWeb.PageController do
  use ShowMeTheCodeWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
