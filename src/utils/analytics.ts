import { SaleRecord, PaymentMethod } from '../types';

export interface KPISummary {
  totalRevenue: number;
  totalUnits: number;
  uniqueOrdersCount: number;
  averageOrderValue: number;
  topProduct: { name: string; revenue: number; units: number };
  topPaymentMethod: { method: PaymentMethod; revenue: number; percentage: number };
}

export function computeKPIs(data: SaleRecord[]): KPISummary {
  if (data.length === 0) {
    return {
      totalRevenue: 0,
      totalUnits: 0,
      uniqueOrdersCount: 0,
      averageOrderValue: 0,
      topProduct: { name: 'N/A', revenue: 0, units: 0 },
      topPaymentMethod: { method: 'Credit Card', revenue: 0, percentage: 0 },
    };
  }

  const totalRevenue = data.reduce((acc, r) => acc + r.price, 0);
  const totalUnits = data.length;

  // Unique orders & their total amounts
  const orderMap = new Map<string, number>();
  data.forEach((r) => {
    orderMap.set(r.orderNumber, (orderMap.get(r.orderNumber) || 0) + r.price);
  });
  const uniqueOrdersCount = orderMap.size;
  const averageOrderValue = uniqueOrdersCount > 0 ? totalRevenue / uniqueOrdersCount : 0;

  // Product aggregation
  const productMap = new Map<string, { revenue: number; units: number }>();
  data.forEach((r) => {
    const existing = productMap.get(r.product) || { revenue: 0, units: 0 };
    productMap.set(r.product, {
      revenue: existing.revenue + r.price,
      units: existing.units + 1,
    });
  });

  let topProduct = { name: 'N/A', revenue: 0, units: 0 };
  productMap.forEach((val, name) => {
    if (val.revenue > topProduct.revenue) {
      topProduct = { name, revenue: val.revenue, units: val.units };
    }
  });

  // Payment aggregation
  const paymentMap = new Map<PaymentMethod, number>();
  data.forEach((r) => {
    paymentMap.set(r.paymentMethod, (paymentMap.get(r.paymentMethod) || 0) + r.price);
  });

  let topPaymentMethod: { method: PaymentMethod; revenue: number; percentage: number } = {
    method: 'Credit Card',
    revenue: 0,
    percentage: 0,
  };

  paymentMap.forEach((rev, method) => {
    if (rev > topPaymentMethod.revenue) {
      topPaymentMethod = {
        method,
        revenue: rev,
        percentage: totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0,
      };
    }
  });

  return {
    totalRevenue,
    totalUnits,
    uniqueOrdersCount,
    averageOrderValue,
    topProduct,
    topPaymentMethod,
  };
}

export interface DayData {
  date: string;
  revenue: number;
  units: number;
  orderCount: number;
  items: SaleRecord[];
}

export function computeDailyTrends(data: SaleRecord[]): DayData[] {
  const map = new Map<string, { revenue: number; units: number; orders: Set<string>; items: SaleRecord[] }>();

  data.forEach((r) => {
    let entry = map.get(r.date);
    if (!entry) {
      entry = { revenue: 0, units: 0, orders: new Set(), items: [] };
      map.set(r.date, entry);
    }
    entry.revenue += r.price;
    entry.units += 1;
    entry.orders.add(r.orderNumber);
    entry.items.push(r);
  });

  return Array.from(map.entries())
    .map(([date, val]) => ({
      date,
      revenue: val.revenue,
      units: val.units,
      orderCount: val.orders.size,
      items: val.items,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface ProductStat {
  product: string;
  revenue: number;
  units: number;
  averagePrice: number;
  shareOfTotalRevenue: number;
}

export function computeProductStats(data: SaleRecord[], totalRevenue: number): ProductStat[] {
  const map = new Map<string, { revenue: number; units: number }>();
  data.forEach((r) => {
    const curr = map.get(r.product) || { revenue: 0, units: 0 };
    map.set(r.product, {
      revenue: curr.revenue + r.price,
      units: curr.units + 1,
    });
  });

  return Array.from(map.entries())
    .map(([product, stat]) => ({
      product,
      revenue: stat.revenue,
      units: stat.units,
      averagePrice: stat.units > 0 ? stat.revenue / stat.units : 0,
      shareOfTotalRevenue: totalRevenue > 0 ? (stat.revenue / totalRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export interface PaymentStat {
  method: PaymentMethod;
  revenue: number;
  units: number;
  ordersCount: number;
  revenueShare: number;
  unitShare: number;
}

export function computePaymentStats(data: SaleRecord[], totalRevenue: number): PaymentStat[] {
  const map = new Map<PaymentMethod, { revenue: number; units: number; orders: Set<string> }>();

  data.forEach((r) => {
    let curr = map.get(r.paymentMethod);
    if (!curr) {
      curr = { revenue: 0, units: 0, orders: new Set() };
      map.set(r.paymentMethod, curr);
    }
    curr.revenue += r.price;
    curr.units += 1;
    curr.orders.add(r.orderNumber);
  });

  const methods: PaymentMethod[] = ['Credit Card', 'Debit Card', 'eWallet', 'Cash'];

  return methods.map((method) => {
    const curr = map.get(method) || { revenue: 0, units: 0, orders: new Set() };
    return {
      method,
      revenue: curr.revenue,
      units: curr.units,
      ordersCount: curr.orders.size,
      revenueShare: totalRevenue > 0 ? (curr.revenue / totalRevenue) * 100 : 0,
      unitShare: data.length > 0 ? (curr.units / data.length) * 100 : 0,
    };
  });
}

export interface BasketStat {
  singleItemOrders: number;
  multiItemOrders: number;
  itemsPerOrderDistribution: { itemsCount: number; orderCount: number }[];
  priceTiers: { tier: string; count: number; revenue: number }[];
}

export function computeBasketStats(data: SaleRecord[]): BasketStat {
  const orderMap = new Map<string, SaleRecord[]>();
  data.forEach((r) => {
    const list = orderMap.get(r.orderNumber) || [];
    list.push(r);
    orderMap.set(r.orderNumber, list);
  });

  let singleItemOrders = 0;
  let multiItemOrders = 0;
  const countDistribution = new Map<number, number>();

  orderMap.forEach((items) => {
    const count = items.length;
    if (count === 1) singleItemOrders++;
    else multiItemOrders++;

    countDistribution.set(count, (countDistribution.get(count) || 0) + 1);
  });

  const itemsPerOrderDistribution = Array.from(countDistribution.entries())
    .map(([itemsCount, orderCount]) => ({ itemsCount, orderCount }))
    .sort((a, b) => a.itemsCount - b.itemsCount);

  // Price tier distribution for individual records
  const tiers = [
    { tier: '< $75', min: 0, max: 74.99, count: 0, revenue: 0 },
    { tier: '$75 - $99', min: 75, max: 99.99, count: 0, revenue: 0 },
    { tier: '$100 - $149', min: 100, max: 149.99, count: 0, revenue: 0 },
    { tier: '$150+', min: 150, max: Infinity, count: 0, revenue: 0 },
  ];

  data.forEach((r) => {
    for (const t of tiers) {
      if (r.price >= t.min && r.price <= t.max) {
        t.count++;
        t.revenue += r.price;
        break;
      }
    }
  });

  return {
    singleItemOrders,
    multiItemOrders,
    itemsPerOrderDistribution,
    priceTiers: tiers.map((t) => ({ tier: t.tier, count: t.count, revenue: t.revenue })),
  };
}
