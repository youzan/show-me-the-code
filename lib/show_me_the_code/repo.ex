defmodule ShowMeTheCode.Repo do
  use Ecto.Repo,
    otp_app: :show_me_the_code,
    adapter: Ecto.Adapters.Postgres
end
