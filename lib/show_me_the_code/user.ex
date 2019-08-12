defmodule ShowMeTheCode.User do
  @derive Jason.Encoder
  @enforce_keys [:name, :id, :slot]
  defstruct name: nil,
            id: nil,
            slot: nil

  @type t() :: %__MODULE__{
          name: String.t(),
          id: String.t(),
          slot: integer()
        }
end
