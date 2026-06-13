import uuid

from fastapi.testclient import TestClient

from app.core.config import get_settings


def unique_login(prefix: str = "test_auth") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def register_payload(login: str, password: str = "secret-password", language: str = "ru") -> dict[str, str]:
    return {
        "login": login,
        "password": password,
        "language": language,
    }


def test_register_sets_cookie_and_default_ru_settings(
    client: TestClient,
    cleanup_users: list[str],
) -> None:
    login = unique_login()
    cleanup_users.append(login)

    response = client.post("/api/auth/register", json=register_payload(login))

    assert response.status_code == 201
    assert response.json()["user"]["login"] == login
    assert response.json()["settings"] == {
        "language": "ru",
        "icon_pack": "cookie_whip",
    }
    assert "password" not in response.text
    assert get_settings().auth_cookie_name in response.cookies
    assert "HttpOnly" in response.headers["set-cookie"]


def test_register_sets_default_en_settings(
    client: TestClient,
    cleanup_users: list[str],
) -> None:
    login = unique_login()
    cleanup_users.append(login)

    response = client.post("/api/auth/register", json=register_payload(login, language="en"))

    assert response.status_code == 201
    assert response.json()["settings"] == {
        "language": "en",
        "icon_pack": "carrot_stick",
    }


def test_register_rejects_duplicate_login(
    client: TestClient,
    cleanup_users: list[str],
) -> None:
    login = unique_login()
    cleanup_users.append(login)

    first_response = client.post("/api/auth/register", json=register_payload(login))
    second_response = client.post("/api/auth/register", json=register_payload(login))

    assert first_response.status_code == 201
    assert second_response.status_code == 409


def test_register_rejects_invalid_language(client: TestClient) -> None:
    response = client.post("/api/auth/register", json=register_payload(unique_login(), language="de"))

    assert response.status_code == 422


def test_me_requires_authentication(client: TestClient) -> None:
    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_login_me_logout_flow(client: TestClient, cleanup_users: list[str]) -> None:
    login = unique_login()
    cleanup_users.append(login)

    register_response = client.post("/api/auth/register", json=register_payload(login))
    assert register_response.status_code == 201

    logout_response = client.post("/api/auth/logout")
    assert logout_response.status_code == 204

    me_after_logout = client.get("/api/auth/me")
    assert me_after_logout.status_code == 401

    login_response = client.post(
        "/api/auth/login",
        json={"login": login, "password": "secret-password"},
    )
    assert login_response.status_code == 200
    assert login_response.json()["user"]["login"] == login

    me_response = client.get("/api/auth/me")
    assert me_response.status_code == 200
    assert me_response.json()["user"]["login"] == login


def test_login_rejects_wrong_password(client: TestClient, cleanup_users: list[str]) -> None:
    login = unique_login()
    cleanup_users.append(login)

    register_response = client.post("/api/auth/register", json=register_payload(login))
    assert register_response.status_code == 201

    response = client.post("/api/auth/login", json={"login": login, "password": "wrong-password"})

    assert response.status_code == 401


def test_change_password_updates_password_without_old_password(
    client: TestClient,
    cleanup_users: list[str],
) -> None:
    login = unique_login()
    cleanup_users.append(login)

    register_response = client.post("/api/auth/register", json=register_payload(login, "old-password"))
    assert register_response.status_code == 201

    change_response = client.post(
        "/api/auth/change-password",
        json={"new_password": "new-password"},
    )
    assert change_response.status_code == 204

    logout_response = client.post("/api/auth/logout")
    assert logout_response.status_code == 204

    old_login_response = client.post(
        "/api/auth/login",
        json={"login": login, "password": "old-password"},
    )
    assert old_login_response.status_code == 401

    new_login_response = client.post(
        "/api/auth/login",
        json={"login": login, "password": "new-password"},
    )
    assert new_login_response.status_code == 200


def test_update_settings_updates_language_and_icon_pack(
    client: TestClient,
    cleanup_users: list[str],
) -> None:
    login = unique_login()
    cleanup_users.append(login)

    register_response = client.post("/api/auth/register", json=register_payload(login, language="ru"))
    assert register_response.status_code == 201

    update_response = client.put(
        "/api/auth/settings",
        json={"language": "en", "icon_pack": "cookie_whip"},
    )

    assert update_response.status_code == 200
    assert update_response.json()["settings"] == {
        "language": "en",
        "icon_pack": "cookie_whip",
    }

    me_response = client.get("/api/auth/me")
    assert me_response.status_code == 200
    assert me_response.json()["settings"] == {
        "language": "en",
        "icon_pack": "cookie_whip",
    }


def test_update_settings_rejects_invalid_icon_pack(
    client: TestClient,
    cleanup_users: list[str],
) -> None:
    login = unique_login()
    cleanup_users.append(login)

    register_response = client.post("/api/auth/register", json=register_payload(login, language="ru"))
    assert register_response.status_code == 201

    update_response = client.put(
        "/api/auth/settings",
        json={"language": "ru", "icon_pack": "invalid_pack"},
    )

    assert update_response.status_code == 422
