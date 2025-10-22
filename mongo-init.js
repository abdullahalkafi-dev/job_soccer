// MongoDB 3-Node Replica Set Initialization
// This runs on the PRIMARY node only when the container first starts

print('='.repeat(50));
print('MongoDB Replica Set Initialization Script');
print('='.repeat(50));

try {
  const status = rs.status();
  print('✅ Replica set already initialized: ' + status.set);
  print('Current members:');
  status.members.forEach(member => {
    print(`  - ${member.name} [${member.stateStr}]`);
  });
} catch (e) {
  print('ℹ️  Replica set not initialized yet.');
  print('Waiting for docker-compose mongodb_setup service to initialize...');
}

print('='.repeat(50));
