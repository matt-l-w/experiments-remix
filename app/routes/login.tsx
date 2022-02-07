import { User } from "@prisma/client";
import { ActionFunction, LinksFunction, redirect, useActionData } from "remix";
import { Link, useSearchParams } from "remix";
import { badRequest } from "~/utils/badRequest";
import { createUserSession, login, register } from "~/utils/session.server";
import { validateLength } from "~/utils/validateLength";
import stylesUrl from "../styles/login.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export type ActionData = {
  formError?: string,
  fieldErrors?: {
    username?: string,
    password?: string,
  },
  fields?: {
    loginType: string,
    username: string,
    password: string,
  },
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const loginType = form.get('loginType');
  const username = form.get('username');
  const password = form.get('password');
  const redirectTo = form.get('redirectTo');
  if (
    typeof loginType !== 'string'
    || typeof username !== 'string'
    || typeof password !== 'string'
    || redirectTo instanceof File
    ) {
    return badRequest<ActionData>({ formError: 'Form not submitted correctly' })
  }
    
  const fields = { loginType, username, password }
  const fieldErrors = {
    username: validateLength(username, 'Username must be longer than 3 characters'),
    password: validateLength(password, 'Password must be longer than 3 characters'),
  }
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields })
  }

  let user: User | null = null;
  switch (loginType) {
    case "register":
      user = await register({ username, password });
      if (!user) return badRequest({ formError: 'Username already taken. Please choose another.' });
      break;
    case "login":
      user = await login({ username, password });
      break;
  }
  if (!user) return badRequest({ formError: 'Login failed. Please try again.', fields });

  return createUserSession(user.id, redirectTo || "jokes");
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData<ActionData>()
  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>Login</h1>
        <form method="post" aria-invalid={Boolean(actionData?.formError)} aria-describedby={actionData?.formError ? "form-error" : undefined}>
          <input
            type="hidden"
            name="redirectTo"
            value={
              searchParams.get("redirectTo") ?? undefined
            }
          />
          <fieldset>
            <legend className="sr-only">
              Login or Register?
            </legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked
              />{" "}
              Login
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
              />{" "}
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input">Username</label>
            <input
              type="text"
              id="username-input"
              name="username"
              defaultValue={actionData?.fields?.username}
              aria-invalid={Boolean(actionData?.fieldErrors?.username) || undefined}
              aria-describedby={actionData?.fieldErrors?.username ? "username-error" : undefined}
            />
            {actionData?.fieldErrors?.username ? (
              <p
                className="form-validation-error"
                role="alert"
                id="username-error"
              >
                {actionData.fieldErrors.username}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              name="password"
              type="password"
              aria-invalid={Boolean(actionData?.fieldErrors?.password) || undefined}
              aria-describedby={actionData?.fieldErrors?.password ? "password-error" : undefined}
            />
            {actionData?.fieldErrors?.password ? (
              <p
                className="form-validation-error"
                role="alert"
                id="password-error"
              >
                {actionData.fieldErrors.password}
              </p>
            ) : null}
          </div>
          {actionData?.formError ? (
            <p
              className="form-validation-error"
              role="alert"
              id="form-error"
            >
              {actionData.formError}
            </p>
          ) : null}
          <button type="submit" className="button">
            Submit
          </button>
        </form>
      </div>
      <div className="links">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/jokes">Jokes</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}