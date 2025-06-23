interface BuyTokensModalProps {
  showBuyTokensModal: boolean;
  setShowBuyTokensModal: (show: boolean) => void;
  tokensToAdd: number;
  setTokensToAdd: (value: number) => void;
  handleBuyTokens: () => void;
}

const BuyTokensModal = ({ 
  showBuyTokensModal,
  setShowBuyTokensModal,
  tokensToAdd,
  setTokensToAdd,
  handleBuyTokens
}: BuyTokensModalProps) => (
  showBuyTokensModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Buy More Tokens</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Tokens to Purchase
          </label>
          <input
            type="number"
            value={tokensToAdd}
            onChange={(e) => setTokensToAdd(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            min="1"
          />
        </div>
        <div className="mb-4">
          <p className="font-medium">Price: ${(tokensToAdd * 0.10).toFixed(2)} USD</p>
          <p className="text-sm text-gray-500">($0.10 per token)</p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowBuyTokensModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleBuyTokens}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Purchase
          </button>
        </div>
      </div>
    </div>
  )
);

export default BuyTokensModal; 