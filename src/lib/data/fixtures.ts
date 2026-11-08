import { fromDocument } from "./coena";

/**
 * The two sample transactions shared from MongoDB Atlas, used only when
 * COENA_DEMO_DATA=1 so screens can be reviewed without a database.
 */
export const demoTransactions = [
  {
    _id: "5d931a399e616a09237dfb2e",
    owner_id: "5d88c9e723392106b13a2ed6",
    wine: {
      cloudKitID: "64623836a02f2d2b715be0a0",
      name: "Marie Antoinette. Vincent",
      cepage: "AOC POUILLY FUISSE",
      type: 2,
      millesime: 2017,
      region: "Bourgogne",
      country: "France",
    },
    date: new Date("2019-09-26T21:26:51.963Z"),
    quantity: 2,
    transactionType: 10,
    tableNumber: 0,
    numberofPeopleatTable: 0,
    containerType: "Bouteille",
    volume: "75cl",
    totalPrice: 84,
    unitPrice: 42,
    currentStock: 3,
    newStock: 1,
    reason: "Vente",
  },
  {
    _id: "5d931a389e616a09237dfa40",
    owner_id: "5d88c9e723392106b13a2ed6",
    wine: {
      cloudKitID: "8010D8FC-1952-4C5D-91A9-6C649A629992",
      name: "COTEAUX D'ENGRAVIES - Roc de Maillols",
      cepage: "VIN DE PAYS D'ARIEGE",
      type: 1,
      millesime: 2016,
      region: "Sud-Ouest",
      country: "France",
    },
    date: new Date("2019-09-12T21:29:37.896Z"),
    quantity: 2,
    transactionType: 10,
    tableNumber: 0,
    numberofPeopleatTable: 0,
    containerType: "Bouteille",
    volume: "75cl",
    totalPrice: 68,
    unitPrice: 34,
    currentStock: 4,
    newStock: 2,
    reason: "Vente",
  },
].map((d) => fromDocument(d));
