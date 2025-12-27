"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { Sparkles, ShoppingCart, Package, Video, Music, Gift, Check, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PurchaseSuccessModal } from "@/components/purchase-success-modal"
import { BountyUseModal } from "@/components/bounty-use-modal"
import { ZenAddModal } from "@/components/zen-add-modal"

interface RewardItem {
  id: string
  name: string
  description: string
  category: "system" | "bounty"
  type: string
  price: number
  media_url: string | null
  media_type: string | null
  icon_name: string | null
}

interface InventoryItem {
  id: string
  item_type: string
  quantity: number
  is_used: boolean
  purchased_at: string
  custom_reward_text?: string
  reward_item?: RewardItem
}

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState<"system" | "bounty" | "inventory">("system")
  const [systemItems, setSystemItems] = useState<RewardItem[]>([])
  const [bountyItems, setBountyItems] = useState<RewardItem[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [auraBalance, setAuraBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const [videoErrors, setVideoErrors] = useState<Set<string>>(new Set())

  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchasedItem, setPurchasedItem] = useState<RewardItem | null>(null)
  const [showBountyModal, setShowBountyModal] = useState(false)
  const [showZenModal, setShowZenModal] = useState(false)
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null)
  const [showWildcardModal, setShowWildcardModal] = useState(false)
  const [customRewardText, setCustomRewardText] = useState("")

  const supabase = createBrowserClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Fetch aura balance
      const { data: profile } = await supabase.from("profiles").select("aura").eq("user_id", user.id).single()

      setAuraBalance(profile?.aura || 0)

      // Fetch rewards items
      const { data: items } = await supabase.from("rewards_items").select("*").order("price", { ascending: true })

      if (items) {
        setSystemItems(items.filter((item) => item.category === "system"))
        setBountyItems(items.filter((item) => item.category === "bounty"))
      }

      // Fetch inventory
      const { data: inventory } = await supabase
        .from("inventory")
        .select("*")
        .eq("user_id", user.id)
        .order("purchased_at", { ascending: false })

      if (inventory) {
        // Get reward item details for each inventory item
        const inventoryWithDetails = await Promise.all(
          inventory.map(async (item) => {
            const { data: rewardItem } = await supabase
              .from("rewards_items")
              .select("*")
              .eq("id", item.item_type)
              .single()

            return { ...item, reward_item: rewardItem }
          }),
        )
        setInventoryItems(inventoryWithDetails)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (item: RewardItem) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      if (auraBalance < item.price) {
        toast({
          title: "Insufficient Aura",
          description: `You need ${item.price - auraBalance} more Aura to purchase this item.`,
          variant: "destructive",
        })
        return
      }

      // Deduct aura
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ aura: auraBalance - item.price })
        .eq("user_id", user.id)

      if (updateError) throw updateError

      // Add to inventory
      const { error: inventoryError } = await supabase.from("inventory").insert({
        user_id: user.id,
        item_type: item.id,
        quantity: 1,
        is_used: false,
      })

      if (inventoryError) throw inventoryError

      setPurchasedItem(item)
      setShowPurchaseModal(true)

      fetchData()
    } catch (error) {
      console.error("Purchase error:", error)
      toast({
        title: "Purchase Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUseBounty = async (inventoryItem: InventoryItem) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from("inventory")
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq("id", inventoryItem.id)

      if (error) throw error

      setSelectedInventoryItem(inventoryItem)
      setShowBountyModal(true)

      fetchData()
    } catch (error) {
      console.error("Redeem error:", error)
    }
  }

  const handleAddToZen = async (inventoryItem: InventoryItem) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from("inventory")
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq("id", inventoryItem.id)

      if (error) throw error

      setSelectedInventoryItem(inventoryItem)
      setShowZenModal(true)

      fetchData()
    } catch (error) {
      console.error("Add to zen error:", error)
    }
  }

  const handleWildcardPurchase = async () => {
    if (!customRewardText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter what you want to reward yourself with.",
        variant: "destructive",
      })
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const wildcardPrice = 100

      if (auraBalance < wildcardPrice) {
        toast({
          title: "Insufficient Aura",
          description: `You need ${wildcardPrice - auraBalance} more Aura to purchase this.`,
          variant: "destructive",
        })
        return
      }

      // Deduct aura
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ aura: auraBalance - wildcardPrice })
        .eq("user_id", user.id)

      if (updateError) throw updateError

      // Add to inventory with custom text
      const { error: inventoryError } = await supabase.from("inventory").insert({
        user_id: user.id,
        item_type: "wildcard_permission",
        quantity: 1,
        is_used: false,
        custom_reward_text: customRewardText.trim(),
      })

      if (inventoryError) throw inventoryError

      toast({
        title: "Wildcard Created!",
        description: `Your custom reward "${customRewardText}" has been added to inventory.`,
      })

      setShowWildcardModal(false)
      setCustomRewardText("")
      fetchData()
    } catch (error) {
      console.error("Wildcard purchase error:", error)
      toast({
        title: "Purchase Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleVideoError = (itemName: string, itemUrl: string, error: any) => {
    setVideoErrors((prev) => new Set(prev).add(itemName))
  }

  const getIconComponent = (iconName: string | null) => {
    const icons: Record<string, any> = {
      Video,
      Music,
      Palette: Package,
      Flame: Zap,
      Gamepad2: Package,
      Pizza: Gift,
      Smartphone: Package,
      Film: Video,
      Moon: Sparkles,
    }
    const Icon = icons[iconName || "Package"]
    return Icon || Package
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-cyan-400 animate-pulse" />
      </div>
    )
  }

  return (
    <>
      <PurchaseSuccessModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        itemName={purchasedItem?.name || ""}
        itemType={purchasedItem?.category || "system"}
      />

      <BountyUseModal
        isOpen={showBountyModal}
        onClose={() => {
          setShowBountyModal(false)
          setSelectedInventoryItem(null)
        }}
        itemName={selectedInventoryItem?.reward_item?.name || ""}
      />

      <ZenAddModal
        isOpen={showZenModal}
        onClose={() => {
          setShowZenModal(false)
          setSelectedInventoryItem(null)
        }}
        itemName={selectedInventoryItem?.reward_item?.name || ""}
      />

      {/* Wildcard Permission Modal */}
      {showWildcardModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowWildcardModal(false)}
        >
          <div
            className="relative bg-gradient-to-br from-purple-900/90 via-gray-900/90 to-pink-900/90 border-2 border-purple-500/50 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowWildcardModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <Sparkles className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 font-mono">What is your desire, Operator?</h2>
                <p className="text-gray-400 text-sm">Create your own custom reward. Any legal move is allowed.</p>
              </div>

              <div>
                <textarea
                  value={customRewardText}
                  onChange={(e) => setCustomRewardText(e.target.value)}
                  placeholder="e.g., Eat a whole pizza, Play 2 hours of GTA, Watch anime all day..."
                  className="w-full h-32 bg-black/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 resize-none font-mono"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-2 font-mono text-right">
                  {customRewardText.length}/200 characters
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-purple-500/20">
                <span className="text-gray-400 text-sm font-mono">Cost:</span>
                <div className="flex items-center gap-2">
                  <img src="/images/aura.png" alt="Aura" className="w-6 h-6" />
                  <span className="text-2xl font-bold text-purple-400 font-mono">100</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowWildcardModal(false)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWildcardPurchase}
                  disabled={!customRewardText.trim() || auraBalance < 100}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Reward
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-black text-white p-8 md:p-4">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
                Rewards Store
              </h1>
              <p className="text-gray-400 font-mono">Spend your earned Aura on upgrades and permissions</p>
            </div>
            {/* Aura Balance */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-black/80 backdrop-blur-sm border border-cyan-500/50 rounded-2xl px-4 md:px-8 py-4 md:py-4">
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                  <img src="/images/aura.png" alt="Aura" className="w-10 h-10 md:w-10 md:h-10" />
                  <div className="text-center md:text-left">
                    <p className="text-xs md:text-xs text-gray-400 font-mono uppercase tracking-wider">Your Balance</p>
                    <p className="text-3xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono">
                      {auraBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-black/40 backdrop-blur-sm border border-gray-800 rounded-xl p-2">
            <button
              onClick={() => setActiveTab("system")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold font-mono transition-all ${
                activeTab === "system"
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <ShoppingCart className="w-5 h-5 inline mr-2" />
              System Shop
            </button>
            <button
              onClick={() => setActiveTab("bounty")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold font-mono transition-all ${
                activeTab === "bounty"
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/50"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <Gift className="w-5 h-5 inline mr-2" />
              Bounty Board
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold font-mono transition-all ${
                activeTab === "inventory"
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <Package className="w-5 h-5 inline mr-2" />
              Inventory
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {activeTab === "system" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systemItems.map((item) => {
                const Icon = getIconComponent(item.icon_name)
                const hasVideoError = videoErrors.has(item.name)

                return (
                  <div
                    key={item.id}
                    className="group relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-md border border-cyan-500/30 rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    {/* Media Preview */}
                    {item.media_url && (
                      <div className="relative h-48 bg-black/50 overflow-hidden">
                        {item.media_type === "video" && !hasVideoError ? (
                          <video
                            src={item.media_url}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                            onError={(e) => handleVideoError(item.name, item.media_url!, e)}
                          />
                        ) : item.media_type === "audio" || (item.media_type === "video" && hasVideoError) ? (
                          <div className="flex items-center justify-center h-full bg-gradient-to-br from-cyan-900/50 to-purple-900/50">
                            <Icon className="w-20 h-20 text-cyan-400" />
                          </div>
                        ) : (
                          <img
                            src={item.media_url || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    )}

                    <div className="relative p-6">
                      <h3 className="text-xl font-bold text-white mb-2 font-mono">{item.name}</h3>
                      <p className="text-gray-400 text-sm mb-4">{item.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src="/images/aura.png" alt="Aura" className="w-6 h-6" />
                          <span className="text-2xl font-bold text-cyan-400 font-mono">{item.price}</span>
                        </div>
                        <button
                          onClick={() => handlePurchase(item)}
                          disabled={auraBalance < item.price}
                          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === "bounty" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Wildcard Permission card */}
              <div className="group relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-md border-2 border-purple-500/50 rounded-xl overflow-hidden hover:border-purple-400/70 transition-all hover:scale-105 shadow-lg shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Premium Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full text-xs font-bold font-mono">
                  PREMIUM
                </div>

                <div className="relative p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center animate-pulse">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white font-mono">Wildcard Permission</h3>
                      <p className="text-xs text-purple-400 font-mono uppercase tracking-wider">Custom Reward</p>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-6">
                    Write your own reward. Any legal move is allowed. Create a personalized permission just for you.
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src="/images/aura.png" alt="Aura" className="w-6 h-6" />
                      <span className="text-2xl font-bold text-purple-400 font-mono">100</span>
                    </div>
                    <button
                      onClick={() => setShowWildcardModal(true)}
                      disabled={auraBalance < 100}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Create
                    </button>
                  </div>
                </div>
              </div>

              {/* Existing bounty items */}
              {bountyItems.map((item) => {
                const Icon = getIconComponent(item.icon_name)
                return (
                  <div
                    key={item.id}
                    className="group relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-md border border-purple-500/30 rounded-xl overflow-hidden hover:border-purple-400/50 transition-all hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="relative p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white font-mono">{item.name}</h3>
                          <p className="text-xs text-purple-400 font-mono uppercase tracking-wider">
                            Real Life Permission
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm mb-6">{item.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src="/images/aura.png" alt="Aura" className="w-6 h-6" />
                          <span className="text-2xl font-bold text-purple-400 font-mono">{item.price}</span>
                        </div>
                        <button
                          onClick={() => handlePurchase(item)}
                          disabled={auraBalance < item.price}
                          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventoryItems.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <Package className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 font-mono">Your inventory is empty. Purchase items from the shops!</p>
                </div>
              ) : (
                inventoryItems.map((item) => {
                  const isWildcard = item.item_type === "wildcard_permission"
                  const rewardItem = item.reward_item

                  if (isWildcard) {
                    return (
                      <div
                        key={item.id}
                        className={`relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-md border-2 rounded-xl overflow-hidden ${
                          item.is_used ? "opacity-50 border-gray-700" : "border-purple-500/50"
                        }`}
                      >
                        {item.is_used && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-10">
                            <div className="text-center">
                              <Check className="w-16 h-16 text-green-400 mx-auto mb-2" />
                              <p className="text-green-400 font-mono font-bold">USED</p>
                            </div>
                          </div>
                        )}

                        <div className="relative p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                              <Sparkles className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white font-mono">Wildcard Permission</h3>
                              <p className="text-xs text-purple-400 font-mono uppercase">Custom Reward</p>
                            </div>
                          </div>

                          <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4 mb-4">
                            <p className="text-gray-300 text-sm italic">"{item.custom_reward_text}"</p>
                          </div>

                          <p className="text-gray-400 text-xs mb-4">
                            Purchased {new Date(item.purchased_at).toLocaleDateString()}
                          </p>

                          {!item.is_used && (
                            <button
                              onClick={() => handleUseBounty(item)}
                              className="w-full py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50"
                            >
                              <Check className="w-4 h-4" />
                              Use Wildcard
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  }

                  if (!rewardItem) return null

                  const Icon = getIconComponent(rewardItem.icon_name)
                  const hasVideoError = videoErrors.has(rewardItem.name)

                  return (
                    <div
                      key={item.id}
                      className={`relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-md border rounded-xl overflow-hidden ${
                        item.is_used ? "opacity-50 border-gray-700" : "border-cyan-500/30"
                      }`}
                    >
                      {item.is_used && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-10">
                          <div className="text-center">
                            <Check className="w-16 h-16 text-green-400 mx-auto mb-2" />
                            <p className="text-green-400 font-mono font-bold">USED</p>
                          </div>
                        </div>
                      )}

                      {rewardItem.media_url && (
                        <div className="relative h-32 bg-black/50 overflow-hidden">
                          {rewardItem.media_type === "video" && !hasVideoError ? (
                            <video
                              src={rewardItem.media_url}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                              onError={(e) => handleVideoError(rewardItem.name, rewardItem.media_url!, e)}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gradient-to-br from-cyan-900/50 to-purple-900/50">
                              <Icon className="w-12 h-12 text-cyan-400" />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="relative p-6">
                        <h3 className="text-lg font-bold text-white mb-2 font-mono">{rewardItem.name}</h3>
                        <p className="text-gray-400 text-xs mb-4">
                          Purchased {new Date(item.purchased_at).toLocaleDateString()}
                        </p>

                        {!item.is_used && (
                          <button
                            onClick={() =>
                              rewardItem.category === "system" ? handleAddToZen(item) : handleUseBounty(item)
                            }
                            className={`w-full py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                              rewardItem.category === "system"
                                ? "bg-gradient-to-r from-cyan-500 to-purple-500 hover:shadow-lg hover:shadow-cyan-500/50"
                                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50"
                            }`}
                          >
                            {rewardItem.category === "system" ? (
                              <>
                                <Zap className="w-4 h-4" />
                                Add to Zen
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                Use Bounty
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
