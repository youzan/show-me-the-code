defmodule ShowMeTheCode.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    # List all child processes to be supervised
    children = [
      # Start the Ecto repository
      ShowMeTheCode.Repo,
      # Start the endpoint when the application starts
      ShowMeTheCodeWeb.Endpoint,
      # Starts a worker by calling: ShowMeTheCode.Worker.start_link(arg)
      # {ShowMeTheCode.Worker, arg},
      {ShowMeTheCode.Room.Registry, name: ShowMeTheCode.Room.Registry},
      {ShowMeTheCode.Room.Watcher, name: ShowMeTheCode.Room.Watcher},
      {DynamicSupervisor, name: ShowMeTheCode.Room.Supervisor, strategy: :one_for_one},
      ShowMeTheCode.Room.Presence
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: ShowMeTheCode.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    ShowMeTheCodeWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
