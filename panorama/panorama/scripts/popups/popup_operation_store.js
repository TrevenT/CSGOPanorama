
'use-strict';

var CapabilityOperationStore = ( function()
{
	var _Init = function()
	{
		var nActiveSeason = GameTypesAPI.GetActiveSeasionIndexValue();

		if( !OperationUtil.ValidateOperationInfo( nActiveSeason ) || !OperationUtil.GetOperationInfo().bPremiumUser )
		{
			              
			$.DispatchEvent( 'UIPopupButtonClicked', '' );
			return;
		}

		StarsShoppingCart.Init();

		               
		$.GetContextPanel().SetDialogVariableInt( 'after_purchase_stars', OperationUtil.GetOperationInfo().nCoinRank );

		SetCurrrentStars();
		                          
		StarsShoppingCart.SelectStoreTab();
		StarsShoppingCart.SetYourRankIndicator();
	};

	var SetCurrrentStars = function( )
	{
		var starsEarned = OperationUtil.GetOperationInfo().nTierUnlocked;
		
		$.GetContextPanel().SetDialogVariableInt( 'total_stars', starsEarned );
		$.GetContextPanel().Data().starsEarned = starsEarned;
	};

	var _SetStarsLevelsAfterPurchase = function( nStarsInCart )
	{
		$.GetContextPanel().SetHasClass( 'popup-operation-store-cart-empty', nStarsInCart <= 0 );

		if ( !nStarsInCart )
		{
			return;
		}
		
		var newStarValue = $.GetContextPanel().Data().starsEarned + nStarsInCart;
		var animName = ( $.GetContextPanel().Data().oldStarsTotal &&  $.GetContextPanel().Data().oldStarsTotal <= newStarValue ) ?
			'popup-operation-progress-anim' : 
			'popup-operation-progress-remove-anim';

		$.GetContextPanel().Data().oldStarsTotal = newStarValue;
	
		$.GetContextPanel().FindChildInLayoutFile( 'id-operation-store-progress-after').AddClass( animName );
		$.Schedule( 0.2, function() { $.GetContextPanel().SetDialogVariableInt( 'after_purchase_stars', newStarValue ); } );
		$.Schedule( 0.5, function() { $.GetContextPanel().FindChildInLayoutFile( 'id-operation-store-progress-after').RemoveClass( animName ); } );
	};

	var _ClosePopup = function()
	{
		$.DispatchEvent( 'OnOperationStoreClosed', '' );
		$.DispatchEvent( 'UIPopupButtonClicked', '' );
		StarsShoppingCart.ResetTimeouthandle();
	};

	return {
		Init: _Init,
		SetStarsLevelsAfterPurchase: _SetStarsLevelsAfterPurchase,
		ClosePopup: _ClosePopup
	};
} )();

var StarsShoppingCart = ( function()
{
	var ARRAY_STORE_ITEMS = [
		{
			rank_restriction: 2,
			storeids: [ 4609, 4610 ],
			coinid: 4550
		},
		{
			rank_restriction: 3,
			storeids: [ 4614, 4615 ],
			coinid: 4551
		},
		{
			rank_restriction: 4,
			storeids: [ 4616, 4617 ],
			coinid: 4552
		},
	];

	var MAX_QUANTITY = 50;
	var _nStarsInCart = 0;
	var m_scheduleHandle = null;
	var m_aCartItemIds = [];
	var m_NewItemsList = [];

	var elParent = $.GetContextPanel().FindChildInLayoutFile( 'popup-operation-store-rows' );

	var _Init = function()
	{
		var elOK = $.GetContextPanel().FindChildInLayoutFile( 'AsyncItemWorkAcceptConfirm' );
		elOK.SetPanelEvent( 'onactivate', _OnActivate.bind( undefined, elOK, 'purchase') );

		var elApply = $.GetContextPanel().FindChildInLayoutFile( 'AsyncItemWorkUseItem' );
		elApply.SetPanelEvent( 'onactivate', _OnActivate.bind( undefined, elApply, 'useitem' ) );

		_GetPricingDiscounts();
	};

	var _GetPricingDiscounts = function()
	{
		var priceForEachRankPerStar = {};
		var elContainer = $.GetContextPanel().FindChildInLayoutFile( 'popup-operation-store-subtitle-container' );
		var currentRank = OperationUtil.GetOperationInfo().nCoinRank;

		ARRAY_STORE_ITEMS.forEach( function( rank )
		{
			var elLabel = elContainer.Children().find( element => element.GetAttributeInt( 'data-rank', 0 ) === rank.rank_restriction );

			rank.storeids.forEach( function( defIndex )
			{
				var fauxItemId = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( defIndex.toString(), 0 );
				var nPriceIOfItem = parseInt( ItemInfo.GetStoreSalePrice( fauxItemId, 1, '#' ));

				                                   
				var starsInItem = InventoryAPI.GetItemAttributeValue( fauxItemId, 'upgrade level' );
				var nPricePerStar = nPriceIOfItem / starsInItem;
				
				if ( !priceForEachRankPerStar[ 'price_for_rank' + rank.rank_restriction ] )
				{
					priceForEachRankPerStar[ 'price_for_rank' + rank.rank_restriction ] = 0;
				}

				priceForEachRankPerStar[ 'price_for_rank' + rank.rank_restriction ] += nPricePerStar;
			} );

			var baseRankPricePerItemCombined = priceForEachRankPerStar[ 'price_for_rank' + ARRAY_STORE_ITEMS[ 0 ].rank_restriction ];
			var RankPricePerItemCombined = priceForEachRankPerStar[ 'price_for_rank' + rank.rank_restriction ];
			var difference = baseRankPricePerItemCombined - RankPricePerItemCombined;
			var average = ( baseRankPricePerItemCombined + RankPricePerItemCombined ) / 2;
			var percentDiscount = Math.floor( ( difference / average ) * 100 );
			elLabel.SetDialogVariableInt( 'discount_per_star', percentDiscount );
			
			if ( rank.rank_restriction > currentRank )
			{
				var fauxCoinId = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( rank.coinid.toString(), 0 );
				var missionsThreshold = InventoryAPI.GetItemAttributeValue( fauxCoinId, 'upgrade threshold' );
				elLabel.SetDialogVariableInt( 'missions_remaining', ( missionsThreshold - OperationUtil.GetOperationInfo().nMissionsCompleted ) );
				elLabel.SetDialogVariable( 'coin_type', $.Localize( '#op_store_coin_type_' + rank.rank_restriction ) );

				elLabel.text = $.Localize( '#op_store_rank_discounts', elLabel );
			}
			else if ( rank.rank_restriction === currentRank || ( rank.rank_restriction === 4 && currentRank > 4 ))
			{
				elLabel.SetDialogVariable( 'coin_type', $.Localize( '#op_store_coin_type_' + currentRank ) );
				elLabel.text = currentRank > 2 ? $.Localize( '#op_store_rank_discounts_current', elLabel ) :
					$.Localize( '#op_store_your_coin', elLabel );
			}
			else 
			{
				elLabel.visible = false;
			}
		} );
	};


	var _SelectStoreTab = function()
	{
		var nRank = OperationUtil.GetOperationInfo().nCoinRank;
		
		$.GetContextPanel().FindChildInLayoutFile( 'popup-operation-store-rank-' + nRank ).checked = true;
		_UpdateStoreBasedOnCoinRank( nRank );
	};

	var _SetYourRankIndicator = function()
	{
		var ChildrenList = $.GetContextPanel().FindChildInLayoutFile( 'popup-operation-current-rank' ).Children();
		
		ChildrenList.filter( entry => Number( entry.GetAttributeString( 'data-rank', '' )) <= OperationUtil.GetOperationInfo().nCoinRank ).forEach(
			element => {
				element.AddClass( 'popup-operation-coin-progress-fill' );
		});
	};

	var _UpdateStoreBasedOnCoinRank = function( nRank, bIsPreview = false )
	{
		var oStoreData = ARRAY_STORE_ITEMS.find( rank => rank.rank_restriction === nRank );

		                                  
		oStoreData.storeids.forEach( element => {

			var elRow = $.CreatePanel( 'Panel', elParent, element );
			elRow.BLoadLayoutSnippet( 'store-row' );

			var fauxItemId = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( element.toString(), 0 );
			var starsCount = InventoryAPI.GetItemAttributeValue( fauxItemId, 'upgrade level' );
			var discount = ItemInfo.GetStoreSalePercentReduction( fauxItemId, 1 );
			elRow.Data().itemid = fauxItemId;
			elRow.Data().quantity = 0;
			elRow.Data().starsCount = starsCount;

			                          
			if ( !discount )
			{
				elRow.AddClass( 'popup-operation-store-row--no-discount' );
			}
			else
			{
				elRow.SetDialogVariable( 'store-item-discount', discount );
				elRow.SetDialogVariable( 'store-item-original-price', ItemInfo.GetStoreOriginalPrice( fauxItemId, 1 ) );
			}

			elRow.SetDialogVariable( 'quantity_name', starsCount );
			elRow.SetDialogVariable( 'store-item-name', ItemInfo.GetName( fauxItemId ) );
			elRow.SetDialogVariable( 'store-item-sale-price', ItemInfo.GetStoreSalePrice( fauxItemId, 1 ) );
			elRow.SetDialogVariableInt( 'store-item-quantity', elRow.Data().quantity );

			                              
			elRow.FindChildInLayoutFile( 'popup-operation-store-count-increment' ).enabled = !bIsPreview;
			elRow.FindChildInLayoutFile( 'popup-operation-store-count-increment' ).SetPanelEvent(
				'onactivate',
				_AddItem.bind( undefined, elRow ) );
			
			elRow.FindChildInLayoutFile( 'popup-operation-store-count-decrement' ).enabled = !bIsPreview;
			elRow.FindChildInLayoutFile( 'popup-operation-store-count-decrement' ).SetPanelEvent(
				'onactivate',
				_RemoveItem.bind( undefined, elRow ) );
			
			_UpdateRowPurchasePriceQuantity( elRow );
		} );
		
		elParent.Children()[ elParent.Children().length - 1 ].AddClass( 'popup-operation-store-row-bottom-border' );
	};
	
	var _AddItem = function( elRow )
	{
		if ( elRow.Data().quantity + 1 > MAX_QUANTITY )
		{
			return;
		}
		
		elRow.Data().quantity = ++elRow.Data().quantity;
		elRow.SetDialogVariableInt( 'store-item-quantity', elRow.Data().quantity );
		_UpdateRowPurchasePriceQuantity( elRow );
	};

	var _RemoveItem = function( elRow )
	{
		if ( elRow.Data().quantity - 1 < 0 )
		{
			return;
		}
		
		elRow.Data().quantity = --elRow.Data().quantity;
		elRow.SetDialogVariableInt( 'store-item-quantity', elRow.Data().quantity );
		_UpdateRowPurchasePriceQuantity( elRow );
	};

	var _UpdateRowPurchasePriceQuantity = function( elRow )
	{
		var quantity = elRow.Data().quantity * Number( elRow.Data().starsCount );
		var price = !quantity ? '-' : ItemInfo.GetStoreSalePrice( elRow.Data().itemid, elRow.Data().quantity );
		var dispQuantity = !quantity ? '-' : quantity; 
		
		elRow.SetDialogVariable( 'store-item-purchase-price', price );
		elRow.SetDialogVariable( 'store-item-stars-quantity', dispQuantity );
		_UpdateRowBtnState( elRow );
		_UpdateTotals();
	};

	var _UpdateRowBtnState = function( elRow )
	{
		elRow.FindChildInLayoutFile( 'popup-operation-store-count-decrement' ).enabled = elRow.Data().quantity > 0;
		elRow.FindChildInLayoutFile( 'popup-operation-store-count-increment' ).enabled = elRow.Data().quantity < MAX_QUANTITY;
	};

	var _UpdateTotals = function()
	{
		var rows = elParent.Children();
		var aCartItems = _GetCartItems( rows );
		m_aCartItemIds = _GetItemsInCartAsList( aCartItems );
		var totalStarCount = _GetTotalStarCount( aCartItems );
		var dispTotalStarCount = !totalStarCount ? '-' : totalStarCount;
		var dispPrice = !totalStarCount  ? '-' : _GetTotalPriceOfItems( m_aCartItemIds );

		$.GetContextPanel().SetDialogVariable( 'store-item-price-total', dispPrice );
		$.GetContextPanel().SetDialogVariable( 'store-item-stars-total', dispTotalStarCount );
		CapabilityOperationStore.SetStarsLevelsAfterPurchase( totalStarCount );

		var elOK = $.GetContextPanel().FindChildInLayoutFile( 'AsyncItemWorkAcceptConfirm' );
		elOK.enabled = m_aCartItemIds.length > 0;
	};

	var _GetCartItems = function( rows )
	{
		var aCartItems = [];

		rows.forEach( function( row, index )
		{
			aCartItems[ index ] = {};
			aCartItems[ index ].id = row.Data().itemid;
			aCartItems[ index ].quantity = row.Data().quantity;
		} );

		return aCartItems;
	};

	var _GetItemsInCartAsList = function( aCartItems )
	{
		var aItemsIdsList = [];
		aCartItems.forEach( function( item )
		{
			for ( var i = 0; i < item.quantity; i++ )
			{
				aItemsIdsList.push( item.id );
			}
		} );

		return aItemsIdsList;
	};

	var _GetTotalPriceOfItems = function( aItemsIdsList )
	{
		return StoreAPI.GetStoreItemsSalePrice( aItemsIdsList.join( ',' ) );
	};

	var _GetTotalStarCount = function( aCartItems )
	{
		var total = 0;
		aCartItems.forEach( function( item )
		{
			total += item.quantity * InventoryAPI.GetItemAttributeValue( item.id, 'upgrade level' );
		} );

		return total;
	};

	var _OnActivate= function( btn, workType )
	{
		if ( workType == 'useitem' )
		{
			if ( m_scheduleHandle )
			{
				$.CancelScheduled( m_scheduleHandle );
				m_scheduleHandle = null;
			}

			m_scheduleHandle = $.Schedule( 5, _CancelWaitforCallBack );

			$.GetContextPanel().FindChildInLayoutFile( 'op-Store-spinner' ).RemoveClass( 'hidden' );
			btn.AddClass( 'hidden' );
		}

		_PerformAsyncAction( workType );
	};

	var _PerformAsyncAction = function( workType )
	{
		if ( workType === 'useitem' )
		{
			m_NewItemsList.forEach( item => InventoryAPI.UseTool( item, '' ) );
		}
		else if ( workType == 'purchase' )
		{
			ItemInfo.ItemPurchase( m_aCartItemIds.join( ',' ) );
		}
	};

	var _CancelWaitforCallBack = function( )
	{
		m_scheduleHandle = null;
		
		var elSpinner = $.GetContextPanel().FindChildInLayoutFile( 'op-Store-spinner' );
		elSpinner.AddClass( 'hidden' );

		CapabilityOperationStore.ClosePopup();

		UiToolkitAPI.ShowGenericPopupOk(
			$.Localize( '#SFUI_SteamConnectionErrorTitle' ),
			$.Localize( '#SFUI_InvError_Item_Not_Given' ),
			'',
			function()
			{
			},
			function()
			{
			}
		);
	};

	var _ResetTimeouthandle = function()
	{
		if ( m_scheduleHandle )
		{
			$.CancelScheduled( m_scheduleHandle );
			m_scheduleHandle = null;
		}
	};

	var _ItemAcquired = function( ItemId )
	{
		$.DispatchEvent( "PlaySoundEffect", "rename_purchaseSuccess", "MOUSE" );

		function onlyUnique ( value, index, arr ) 
		{ 
			return arr.indexOf(value) === index;
		}
		
		var unique = m_aCartItemIds.filter( onlyUnique );
		var aDefNames = [];
		unique.forEach( function( item, idx )
		{
			aDefNames.push( ItemInfo.GetItemDefinitionName( item ) );
		} );
		
		if ( aDefNames.includes( ItemInfo.GetItemDefinitionName( ItemId ) ) )
		{
			                
			_ResetTimeouthandle();

			$.DispatchEvent( 'HideStoreStatusPanel', '' );
			_AcknowlegeStars( aDefNames );
			_SetApplyStarsStyles();
		}
	};

	var _AcknowlegeStars = function( aDefNames )
	{
		var bShouldAcknowledge = true;
		m_NewItemsList = AcknowledgeItems.GetItemsByType( aDefNames, bShouldAcknowledge );
		
		if ( m_NewItemsList.length < 1 )
		{
			CapabilityOperationStore.ClosePopup();
			return;
		}
	};

	var _SetApplyStarsStyles = function()
	{
		$.GetContextPanel().AddClass( 'popup-operation-store-apply-stars' );
		$.GetContextPanel().FindChildInLayoutFile( 'op-Store-spinner' ).AddClass( 'hidden' );
		$.GetContextPanel().FindChildInLayoutFile( 'AsyncItemWorkUseItem' ).RemoveClass( 'hidden' );
		$.GetContextPanel().FindChildInLayoutFile( 'AsyncItemWorkAcceptConfirm' ).AddClass( 'hidden' );
	};

	var _OnInventoryUpdate = function()
	{
		var prevStars = $.GetContextPanel().Data().starsEarned;

		OperationUtil.ValidateOperationInfo( OperationUtil.GetOperationInfo().nSeasonAccess );
		var StarsEarned = OperationUtil.GetOperationInfo().nTierUnlocked;

		if ( StarsEarned > prevStars )
		{
			_ResetTimeouthandle();
			$.Schedule( 0.3, function() { $.GetContextPanel().SetDialogVariableInt( 'total_stars', StarsEarned ); } );
			$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.popup_newweapon', 'MOUSE' );
			$.GetContextPanel().FindChildInLayoutFile( 'id-operation-store-progress-apply' ).AddClass( 'popup-operation-apply-stars' );
			$.GetContextPanel().AddClass( 'popup-operation-store-reveal-new-stars' );
			$.GetContextPanel().FindChildInLayoutFile( 'op-Store-spinner' ).AddClass( 'hidden' );
		}
	};

	return {
		Init: _Init,
		nStarsInCart: _nStarsInCart,
		SelectStoreTab: _SelectStoreTab,
		SetYourRankIndicator: _SetYourRankIndicator,
		UpdateStoreBasedOnCoinRank: _UpdateStoreBasedOnCoinRank,
		ResetTimeouthandle: _ResetTimeouthandle,
		ItemAcquired: _ItemAcquired,
		OnInventoryUpdate: _OnInventoryUpdate
	};

} )();

( function()
{
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', StarsShoppingCart.OnInventoryUpdate );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_Store_PurchaseCompleted', StarsShoppingCart.ItemAcquired );
} )();