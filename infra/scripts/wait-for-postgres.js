const { exec } = require("node:child_process");

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout) {
    if (stdout.includes("accepting connections")) {
      return console.log("\n🟢 Postgres está pronto e aceitando conexões!\n");
    }

    process.stdout.write(".");
    checkPostgres();
  }
}

process.stdout.write("\n\n🔴 Aguardando o Postgres aceitar conexões");
checkPostgres();
