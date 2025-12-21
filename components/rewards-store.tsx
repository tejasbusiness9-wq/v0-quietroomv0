"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coins, ShoppingBag, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StoreItem {
  id: string
  name: string
  description: string
  cost: number
  icon: React.ReactNode
  itemType: string
}

export function RewardsStore() {
  const [coins, setCoins] = useState(0)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const { toast } = useToast()

  const storeItems: StoreItem[] = [
    {
      id: "streak-freeze",
      name: "Streak Freeze",
      description: "Save your streak for one missed day",
      cost: 500,
      icon: <Sparkles className="w-8 h-8 text-blue-400" />,
      itemType: "streak_freeze",
    },
  ]

  useEffect(() => {
    fetchCoins()
  }, [])

  const fetchCoins = async () => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase.from("profiles").select("coins").eq("user_id", user.id).single()

    if (!error && data) {
      setCoins(data.coins || 0)
    }
    setLoading(false)
  }

  const handlePurchase = async (item: StoreItem) => {
    if (coins < item.cost) {
      toast({
        title: "Not enough coins",
        description: "Go focus more to earn coins.",
        variant: "destructive",
      })
      return
    }

    setPurchasing(item.id)

    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setPurchasing(null)
      return
    }

    // Deduct coins
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ coins: coins - item.cost })
      .eq("user_id", user.id)

    if (updateError) {
      toast({
        title: "Purchase failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
      setPurchasing(null)
      return
    }

    // Add to inventory
    const { error: inventoryError } = await supabase.from("inventory").insert({
      user_id: user.id,
      item_type: item.itemType,
      is_used: false,
    })

    if (inventoryError) {
      // Rollback coins
      await supabase.from("profiles").update({ coins: coins }).eq("user_id", user.id)

      toast({
        title: "Purchase failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
      setPurchasing(null)
      return
    }

    // Success
    setCoins(coins - item.cost)
    toast({
      title: "Purchase successful!",
      description: `You bought ${item.name}. Check your inventory.`,
    })
    setPurchasing(null)
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading store...</div>
  }

  return (
    <div className="space-y-6">
      {/* Coins Display */}
      <Card className="p-6 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-amber-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-amber-400" />
              <p className="text-4xl font-bold text-foreground">{coins}</p>
              <span className="text-lg text-muted-foreground">coins</span>
            </div>
          </div>
          <ShoppingBag className="w-12 h-12 text-amber-400/50" />
        </div>
      </Card>

      {/* Store Items */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4">Rewards Shop</h3>
        <p className="text-muted-foreground mb-6">Exchange your hard-earned coins for powerful items</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {storeItems.map((item) => (
            <Card key={item.id} className="p-6 hover:border-primary/50 transition-colors">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">{item.icon}</div>
                <h4 className="text-lg font-bold text-foreground mb-2">{item.name}</h4>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <span className="text-2xl font-bold text-primary">{item.cost}</span>
                </div>

                <Button
                  onClick={() => handlePurchase(item)}
                  disabled={coins < item.cost || purchasing === item.id}
                  className="w-full"
                >
                  {purchasing === item.id ? "Purchasing..." : "Purchase"}
                </Button>

                {coins < item.cost && (
                  <p className="text-xs text-muted-foreground mt-2">Need {item.cost - coins} more coins</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Earn More Section */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="text-lg font-bold text-foreground mb-2">How to earn coins?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Complete focus sessions in Zen Mode</li>
          <li>• Finish tasks and goals</li>
          <li>• Maintain your daily streak</li>
          <li>• Unlock achievements</li>
        </ul>
      </Card>
    </div>
  )
}
