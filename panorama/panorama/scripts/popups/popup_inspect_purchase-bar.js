'use-strict';

var InpsectPurchaseBar = ( function()
{
	var m_itemid = '';                                            
	var m_storeItemid = '';                                                                      
	var m_elPanel = null;
	var m_showToolUpsell = false;                                                             

	var _Init = function( elPanel, itemId, funcGetSettingCallback )
	{
		m_storeItemid= funcGetSettingCallback( "storeitemid", "" );
		
		                                                     
		                                          
		m_itemid = !m_storeItemid ? itemId : m_storeItemid;

		if ( !ItemInfo.GetStoreOriginalPrice( m_itemid, 1 ) ||
			( funcGetSettingCallback( 'inspectonly', 'false' ) === 'true' ) ||
			!InventoryAPI.IsValidItemID( m_itemid )
		)
		{
			elPanel.AddClass( 'hidden' );
			return;
		}

		m_elPanel = elPanel;
		m_showToolUpsell = (funcGetSettingCallback( "toolid", '' )) === '' ? true : false;
		elPanel.RemoveClass( 'hidden' );
	
		elPanel.FindChildInLayoutFile( 'PurchaseItemImage' ).itemid = itemId;

		_SetDialogVariables( elPanel, m_itemid );
		_UpdateDecString( elPanel );
		_SetUpPurchaseBtn( elPanel );
		_UpdatePurchasePrice();
	};

	var _SetDialogVariables = function( elPanel, itemId )
	{
		elPanel.SetDialogVariable( "itemname", ItemInfo.GetName( itemId ) );
	};
	
	var _UpdateDecString = function ( ePanel )
	{
		var elDesc = m_elPanel.FindChildInLayoutFile( 'PurchaseItemName' );
		if ( m_storeItemid )
		{
			elDesc.text = ItemInfo.GetName( m_itemid );
		}
		else
		{
			elDesc.text = m_showToolUpsell ?
				$.Localize( '#popup_capability_upsell', m_elPanel ) :
				ItemInfo.GetName( m_itemid );
		}
	};

	var _UpdatePurchasePrice = function ()
	{
		var elBtn = m_elPanel.FindChildInLayoutFile( 'PurchaseBtn' );
		var elDropdown = m_elPanel.FindChildInLayoutFile( 'PurchaseCountDropdown' );
		var qty = 1;

		elDropdown.visible = !_isCoupon();

		if( !_isCoupon() )
		{
			elDropdown.visible = true;
			qty = Number( elDropdown.GetSelected().id );
		}

		var salePrice = ItemInfo.GetStoreSalePrice( m_itemid, qty );
		elBtn.text = salePrice;

		_UpdateSalePrice( ItemInfo.GetStoreOriginalPrice( m_itemid, qty ) );
	};

	var _isCoupon = function()
	{
		var itemType = InventoryAPI.GetItemTypeFromEnum( m_itemid );
		                                 
		return ( itemType === 'coupon' || itemType === 'coupon_crate' ) ? true : false;
	};

	var _SetUpPurchaseBtn = function ( elPanel )
	{
		elPanel.FindChildInLayoutFile( 'PurchaseBtn' ).SetPanelEvent( 'onactivate', _OnActivate);
	};

	var _UpdateSalePrice = function( salePrice )
	{
		var elSalePrice = m_elPanel.FindChildInLayoutFile( 'PurchaseSalePrice' );
		var elSalePercent = m_elPanel.FindChildInLayoutFile( 'PurchaseItemPercent' );
		var salePercent = ItemInfo.GetStoreSalePercentReduction( m_itemid );

		if( salePercent )
		{
			elSalePrice.visible = true;
			elSalePrice.text = salePrice;

			elSalePercent.visible = true;
			elSalePercent.text = salePercent;
			return;
		}

		elSalePrice.visible = false;
		elSalePercent.visible = false;
	};

	var _OnDropdownUpdate = function ()
	{
		_UpdatePurchasePrice();
	};

	var _OnActivate = function()
	{
		var elDropdown = m_elPanel.FindChildInLayoutFile( 'PurchaseCountDropdown' );
		var qty = Number( elDropdown.GetSelected().id );

		var purchaseList = [];

		for ( var i = 0; i < qty; i++ )
		{
			purchaseList.push( m_itemid );
		}

		var purchaseString = purchaseList.join( ',' );
		ItemInfo.ItemPurchase( purchaseString );
	};

	var _ClosePopup = function()
	{
		$.DispatchEvent( 'HideSelectItemForCapabilityPopup' );
		$.DispatchEvent( 'UIPopupButtonClicked', '' );
		$.DispatchEvent( 'CapabilityPopupIsOpen', false );
	};

	return {
		Init: _Init,
		OnDropdownUpdate: _OnDropdownUpdate,
		ClosePopup :_ClosePopup,
	};
} )();

( function()
{

} )();