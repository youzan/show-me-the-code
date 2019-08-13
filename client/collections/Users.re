[@bs.deriving abstract]
type user = {
  id: string,
  name: string,
  slot: int,
};

let make = () => Belt.Map.String.fromArray([||]);

let toPair = user => (idGet(user), user);

let fromArray = users => Belt.Map.String.fromArray(Array.map(toPair, users));

let add = (user, map) => Belt.Map.String.set(map, idGet(user), user);

let addMany = (users, map) =>
  Belt.Map.String.mergeMany(map, Array.map(toPair, users));

let remove = (userId, map) => Belt.Map.String.remove(map, userId);

let first = map => Belt.Map.String.findFirstBy(map, (_, _) => true);

let size = Belt.Map.String.size;

let valuesArray = Belt.Map.String.valuesToArray;

let toArray = Belt.Map.String.toArray;