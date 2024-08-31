import Button from "./ui/button";

interface ILogin {
  searchParams: { error?: string }
};


export default async function Login({ searchParams }: ILogin) {
  // Extract the error message from URL parameters if present
  const error = searchParams.error;

  return (
    <main>
      <div>
        <h1>
          Please log in to continue.
        </h1>
      </div>
      {error && (
        <div>
          <span>{error}</span>
        </div>
      )}
      <form action="/api/login" method="POST">
        <div>
          <div>
            <div>
              <label
                htmlFor="username"
              >
                Username
              </label>
              <div>
                <input
                  id="username"
                  type="username"
                  name="username"
                  placeholder="Username"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
              >
                Password
              </label>
              <div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>
          <Button type="submit">Log in</Button>
        </div>
      </form>
    </main>
  );
}
