defmodule ShowMeTheCodeWeb.RoomController do
  use ShowMeTheCodeWeb, :controller
  alias ShowMeTheCode.{Repo, Room}
  alias Ecto.Multi

  def create_one(conn, params) do
    case pick_expires(params) do
      {:ok, expires} ->
        Repo.insert!(%Room{expires: expires})
        |> (&json(conn, %{response: &1.id})).()

      {:error, _} ->
        send_resp(conn, 400, "invalid expires")
    end
  end

  def create_many(conn, %{"amount" => amount} = params) when is_integer(amount) do
    try do
      expires =
        case pick_expires(params) do
          {:ok, expires} -> expires
          {:error, _} -> throw(:invalid_expires)
        end

      multi =
        Enum.reduce(1..amount, Multi.new(), fn index, multi ->
          Multi.insert(multi, index, %Room{expires: expires})
        end)

      {:ok, result} = Repo.transaction(multi)
      response = Enum.map(result, fn {_, value} -> value.id end)
      json(conn, %{:response => response})
    catch
      :invalid_expires -> send_resp(conn, 400, "invalid expires")
    end
  end

  defp pick_expires(params) do
    expires = params["expires"]

    if expires != nil do
      case NaiveDateTime.from_iso8601(expires) do
        {:ok, expires} -> {:ok, NaiveDateTime.truncate(expires, :second)}
        {:error, _} -> {:error, nil}
      end
    else
      {:ok, nil}
    end
  end
end
