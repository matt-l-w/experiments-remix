import { ActionFunction, LoaderFunction, redirect, useActionData, useLoaderData } from "remix";
import { db } from "~/utils/db.server";
import { validateLength } from "../../utils/validateLength";
import { badRequest } from "../../utils/badRequest";
import { User } from "@prisma/client";
import { getUserId } from "~/utils/session.server";

export type LoaderData = {
  userId: User['id']
}

export type ActionData = {
  formError?: string,
  fieldErrors?: {
    name?: string,
    content?: string,
  },
  fields?: {
    name: string,
    content: string,
  },
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) return redirect('/login?redirectTo=/jokes/new')

  const form = await request.formData();
  const name = form.get('name');
  const content = form.get('content');
  if (
    typeof name !== 'string'
    || typeof content !== 'string'
    ) {
      return badRequest<ActionData>({ formError: 'Form not submitted correctly' })
    }
    
  const fields = { userId, name, content }
  const fieldErrors = {
    name: validateLength(name, 'The joke\'s name is too short'),
    content: validateLength(content, 'The joke is too short'),
  }
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields })
  }
  const joke = await db.joke.create({ data: fields, select: { id: true } })
  return redirect(`/jokes/${joke.id}`)
}

export default function NewJokeRoute() {
  const actionData = useActionData<ActionData>()

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method="post" aria-invalid={Boolean(actionData?.formError)} aria-describedby={actionData?.formError ? "form-error" : undefined}>
        <div>
          <label>
            Name: <input
              type="text"
              name="name"
              defaultValue={actionData?.fields?.name}
              aria-invalid={Boolean(actionData?.fieldErrors?.name) || undefined}
              aria-describedby={actionData?.fieldErrors?.name ? "name-error" : undefined}
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p
              className="form-validation-error"
              role="alert"
              id="name-error"
            >
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content: <textarea
              name="content"
              defaultValue={actionData?.fields?.content}
              aria-invalid={Boolean(actionData?.fieldErrors?.content) || undefined}
              aria-describedby={actionData?.fieldErrors?.content ? "content-error" : undefined}
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              role="alert"
              id="content-error"
            >
              {actionData.fieldErrors.content}
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
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}