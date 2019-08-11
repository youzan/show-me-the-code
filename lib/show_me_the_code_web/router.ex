defmodule ShowMeTheCodeWeb.Router do
  use ShowMeTheCodeWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", ShowMeTheCodeWeb do
    pipe_through :api

    post "/create-one", RoomController, :create_one
    post "/create-many", RoomController, :create_many
  end

  # Other scopes may use custom stacks.
  # scope "/api", ShowMeTheCodeWeb do
  #   pipe_through :api
  # end
end
