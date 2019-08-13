[@bs.deriving abstract]
type user = {
  id: string,
  name: string,
  slot: int,
};

module UserComparator =
  Belt.Id.MakeComparable({
    type t = user;
    let cmp = (user1, user2) =>
      Pervasives.compare(slotGet(user1), slotGet(user2));
  });

let make = () => Belt.Map.make(~id=(module UserComparator));

let add = (user, map) => Belt.Map.set(map, (idGet(user), user));

let addMany = (users, map) =>
  Belt.Map.mergeMany(map, Array.map(user => (idGet(user), user), users));

let remove = (userId, map) => Belt.Map.remove(map, userId);

let first = map => Belt.Map.findFirstBy(map, (_, _) => true);

let size = map => Belt.Map.size(map);

let valuesArray = map => Belt.Map.valuesToArray(map);