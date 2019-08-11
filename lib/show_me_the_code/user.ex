defmodule ShowMeTheCode.User do
  use TypedStruct

  typedstruct do
    field :name, String.t(), enforce: true
    field :id, String.t(), enforce: true
    field :slot, integer(), enforce: true
  end
end
