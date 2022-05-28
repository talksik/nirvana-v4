import Realm from 'realm';

const id = 'nirvana-ouauo';

const realmApp = new Realm.App({ id });

async function run() {
  const config = {
    id,
  };
}

run().catch((err) => {
  console.error('Failed to open realm:', err);
});

export default realmApp;
