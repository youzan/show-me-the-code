defmodule ShowMeTheCode.Room do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "room" do
    field :content, :string, default: "javascript"
    field :language, :string, default: ""
    field :expires, :naive_datetime

    timestamps()
  end

  @doc false
  def changeset(room, attrs) do
    room
    |> cast(attrs, [:id, :content, :languge, :expires])
    |> validate_required([:content, :language])
  end
end
