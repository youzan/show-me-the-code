defmodule ShowMeTheCode.User do
  use TypedStruct

  typedstruct do
    field :name, String.t(), enforce: true
    field :id, String.t(), enforce: true
    field :color, integer(), enforce: true
  end
end
