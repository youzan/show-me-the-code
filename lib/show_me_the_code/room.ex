defmodule ShowMeTheCode.Room do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "room" do
    field :content, :string, default: ""
    field :language, :string, default: "javascript"
    field :expires, :naive_datetime

    timestamps()
  end

  @doc false
  def changeset(room, attrs) do
    room
    |> cast(attrs, [:id, :content, :language, :expires])
    |> validate_not_nil([:content, :language])
  end

  defp validate_not_nil(changeset, fields) do
    Enum.reduce(fields, changeset, fn field, changeset ->
      if get_field(changeset, field) == nil do
        add_error(changeset, field, "nil")
      else
        changeset
      end
    end)
  end
end
