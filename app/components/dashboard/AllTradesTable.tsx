"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Trade, TradingAccount } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getProfitLossClassName } from "@/lib/ui-utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface AllTradesTableProps {
  trades: Trade[]
  account: TradingAccount
  onClose: () => void
  onTradeClick: (tradeId: string) => void
}

export function AllTradesTable({ trades, account, onClose, onTradeClick }: AllTradesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const tradesPerPage = 10;
  const isMobile = useIsMobile();

  const closedTrades = trades
    .filter(trade => trade.outcome !== 'OPEN')
    .filter(trade => trade.currencyPair.toLowerCase().includes(searchTerm.toLowerCase()));

  const paginatedTrades = closedTrades.slice(
    (currentPage - 1) * tradesPerPage,
    currentPage * tradesPerPage
  );

  const totalPages = Math.ceil(closedTrades.length / tradesPerPage);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All Trades</CardTitle>
            <CardDescription>All closed trades for this account</CardDescription>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Input
              placeholder="Filter by symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-96"
            />
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <div className="space-y-4">
            {paginatedTrades.map((trade) => (
              <div 
                key={trade.id} 
                onClick={() => onTradeClick(trade.id)} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div>
                  <p className="font-medium">{trade.currencyPair}</p>
                  <p className="text-sm text-gray-600">{formatDate(trade.openDate)}</p>
                </div>
                <Badge 
                  className={`${
                    trade.outcome === 'WIN' ? 'bg-green-100 text-green-800' :
                    trade.outcome === 'LOSS' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {trade.outcome}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Open Date</TableHead>
                <TableHead>Close Date</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead className="text-right">Net P/L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTrades.map((trade, index) => (
                <TableRow 
                  key={trade.id} 
                  onClick={() => onTradeClick(trade.id)} 
                  className="cursor-pointer"
                >
                  <TableCell>{(currentPage - 1) * tradesPerPage + index + 1}</TableCell>
                  <TableCell>{trade.currencyPair}</TableCell>
                  <TableCell>{formatDate(trade.openDate)}</TableCell>
                  <TableCell>{trade.outcome !== 'OPEN' ? formatDate(trade.updatedAt) : '-'}</TableCell>
                  <TableCell>
                    <Badge 
                      className={`${
                        trade.outcome === 'WIN' ? 'bg-green-100 text-green-800' :
                        trade.outcome === 'LOSS' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {trade.outcome}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right ${getProfitLossClassName(trade.profitLoss)}`}>
                    {formatCurrency(trade.profitLoss, account.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  )
}