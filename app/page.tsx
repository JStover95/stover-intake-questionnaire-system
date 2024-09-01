import Button from "./ui/button";

interface ILogin {
  searchParams: { error?: string }
};


export default async function Login({ searchParams }: ILogin) {
  // Extract the error message from URL parameters if present
  const error = searchParams.error;

  return (
    <main className="align-center column h600 justify-center">
      <div className="border-light border-radius p2 w350">

        {/* The header and any error, if present */}
        <div className="justify-center">
          <h2>
            Please log in to continue.
          </h2>
        </div>
        {error && (
          <div className="justify-center mb1">
            <span className="font-s font-red">{error}</span>
          </div>
        )}

        {/* The login form */}
        <form action="/api/login" method="POST">
          <div className="align-center column">
            <div className="align-center column">
              <div className="mb2">
                <div>
                  <input
                    id="username"
                    type="username"
                    name="username"
                    placeholder="Username"
                    className="input input-m"
                  />
                </div>
              </div>
              <div className="mb2">
                <div>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="input input-m"
                  />
                </div>
              </div>
            </div>
            <Button type="submit" className="btn btn-large btn-primary">Log in</Button>
          </div>
        </form>
      </div>
    </main>
  );
}
