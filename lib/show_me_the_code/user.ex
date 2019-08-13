defmodule ShowMeTheCode.User do
  def from_socket(socket) do
    Map.take(socket.assigns, [:id, :username, :slot])
  end
end
