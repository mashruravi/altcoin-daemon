# altcoin-daemon
Daemon process for altcoin ticker that fetches, processes and stores data

 - Stores data in MongoDB.
 - Currently looks for MongoDB instance on port 27017.
 - Gets altcoin data from Pusher. Requires Pusher key to be set in PUSHER_KEY environment variable.
