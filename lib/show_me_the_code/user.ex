defmodule ShowMeTheCode.User do
  @derive Jason.Encoder
  @enforce_keys [:id, :name, :slot]
  defstruct [:id, :name, :slot]

  def from_socket(socket) do
    %{id: id, username: name, slot: slot} = socket.assigns
    %ShowMeTheCode.User{id: id, name: name, slot: slot}
  end
end
