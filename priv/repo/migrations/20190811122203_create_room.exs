defmodule ShowMeTheCode.Repo.Migrations.CreateRoom do
  use Ecto.Migration

  def change do
    create table(:room,  primary_key: false) do
      add :id, :uuid, primary_key: true
      add :content, :text, default: ""
      add :language, :string, default: "javascript"
      add :expires, :naive_datetime

      timestamps()
    end
  end
end
