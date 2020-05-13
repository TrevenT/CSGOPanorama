
'use-strict';

var InspectAsyncActionBar = ( function()
{
	var m_scheduleHandle = null;
	var m_itemid = '';                             
	var m_worktype = '';                                                                             
	var m_okButtonClass = 'Positive';                                             
	var m_toolid = '';                                                             
	var m_isDecodeableKeyless = false;                                                   
	var m_asynActionForceHide = false;
	var m_showAsyncActionDesc = false;

	var _Init = function( elPanel, itemId, funcGetSettingCallback, funcCallbackOnAction )
	{
		m_worktype = funcGetSettingCallback( 'asyncworktype', '' );
		m_toolid = funcGetSettingCallback( 'toolid', '' );
		m_isDecodeableKeyless = ( funcGetSettingCallback( 'decodeablekeyless', 'false' ) === 'true' ) ? true : false;
		m_asynActionForceHide = ( funcGetSettingCallback( 'asyncforcehide', 'false' ) === 'true' ) ? true : false;
		m_showAsyncActionDesc = ( funcGetSettingCallback( 'asyncactiondescription', 'no' ) === 'yes' ) ? true : false;

		                                      
		                               

		if ( m_asynActionForceHide ||
			!m_worktype || 
			( m_worktype === 'nameable' && !m_toolid ) ||
			_DoesNotMeetDecodalbeRequirements()
		)
		{
			elPanel.AddClass( 'hidden' );
			return;
		}

		m_itemid = itemId;
		elPanel.RemoveClass( 'hidden' );
		
		m_okButtonClass = funcGetSettingCallback( 'asyncworkbtnstyle', m_okButtonClass );

		_SetUpButtonStates( elPanel, funcGetSettingCallback, funcCallbackOnAction );
		_SetUpDescription( elPanel );

		if ( m_worktype === 'prestigecheck' )
		{	                                                      
			_OnAccept( elPanel );
		}
		
		$.RegisterForUnhandledEvent( 'PanoramaComponent_Inventory_ItemCustomizationNotification', InspectAsyncActionBar.OnItemCustomization );
		
		if( m_worktype !== 'decodeable' && m_worktype !== 'nameable' && m_worktype !== 'remove_sticker' )
		{
			$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', InspectAsyncActionBar.OnMyPersonaInventoryUpdated );
			$.RegisterForUnhandledEvent( 'PanoramaComponent_Inventory_PrestigeCoinResponse', InspectAsyncActionBar.OnInventoryPrestigeCoinResponse );
		}
	};

	var _DoesNotMeetDecodalbeRequirements = function()
	{
		return m_worktype === 'decodeable' && ( !m_toolid && !m_isDecodeableKeyless );
	};

	var _PerformAsyncAction = function( funcGetSettingCallback, funcCallbackOnAction )
	{
		                                           
		if ( m_worktype === 'useitem' )
		{
			InventoryAPI.UseTool( m_itemid, '' );
		}
		else if ( m_worktype === 'delete' )
		{
			InventoryAPI.DeleteItem( m_itemid );
		}
		else if ( m_worktype === 'prestigecheck' )
		{
			InventoryAPI.RequestPrestigeCoin();
		}
		else if ( m_worktype === 'prestigeget' || m_worktype === 'prestigeupgrade' )
		{
			InventoryAPI.RequestPrestigeCoin( InventoryAPI.GetItemDefinitionIndex( m_itemid ) );
		}
		if ( m_worktype === 'nameable' )
		{
			$.DispatchEvent( "PlaySoundEffect", "rename_applyConfirm", "MOUSE" );
			InventoryAPI.UseTool( m_toolid, m_itemid );
			funcCallbackOnAction();
		}
		if ( m_worktype === 'can_sticker' )
		{
			$.DispatchEvent( 'PlaySoundEffect', 'sticker_applyConfirm', 'MOUSE' );

			var selectedStickerSlot = funcGetSettingCallback( 'selectedstickerslot', '' );
			var bIsValid = InventoryAPI.SetStickerToolSlot( m_itemid, selectedStickerSlot );

			if ( bIsValid )
			{
				InventoryAPI.UseTool( m_toolid, m_itemid );
				funcCallbackOnAction();
			}
		}
		if ( m_worktype === 'decodeable' )
		{
			                                                                 
			if ( ItemInfo.ItemMatchDefName( m_itemid, 'spray' ) )
			{
				InventoryAPI.UseTool( m_itemid, '' );
			}
			else
			{
				InventoryAPI.UseTool( m_toolid, m_itemid );
			}

			$.DispatchEvent( 'StartDecodeableAnim' );
		}
	};
	
	var _SetUpButtonStates = function( elPanel, funcGetSettingCallback, funcCallbackOnAction )
	{
		var elOK = elPanel.FindChildInLayoutFile( 'AsyncItemWorkAcceptConfirm' );

		if( _HideOkButton() )
		{
			elOK.visible = false;
			return;
		}

		elOK.text = '#popup_'+m_worktype+'_button';
		elOK.AddClass( m_okButtonClass );
		
		elOK.SetPanelEvent( 'onactivate', _OnAccept.bind( undefined, elPanel, funcGetSettingCallback, funcCallbackOnAction ) );
	};

	var _HideOkButton = function ()
	{
		return ( m_worktype === 'remove_sticker' ) ? true : false;
	}

	var _SetUpDescription = function( elPanel )
	{
		var elDescLabel = elPanel.FindChildInLayoutFile( 'AsyncItemWorkDesc' );
		var elDescImage = elPanel.FindChildInLayoutFile( 'AsyncItemWorkDescImage' );
		
		if ( m_showAsyncActionDesc )
		{
			elDescLabel = elPanel.FindChildInLayoutFile( 'AsyncItemWorkDesc' );
			elDescImage = elPanel.FindChildInLayoutFile( 'AsyncItemWorkDescImage' );

			elDescImage.itemid = m_toolid;

			elDescLabel.SetDialogVariable( 'itemname', ItemInfo.GetName( m_toolid ) );
			elDescLabel.text = $.Localize( 'popup_'+m_worktype+'_async_desc', elDescLabel );
		}	

		elDescLabel.visible = m_showAsyncActionDesc;
		elDescLabel.visible = m_showAsyncActionDesc;
	};

	var _EnableDisableOkBtn = function( elPanel, bEnable )
	{
		var elOK = elPanel.FindChildInLayoutFile( 'AsyncItemWorkAcceptConfirm' );

		if( !elOK.visible )
			return;

		if( elOK.enabled !== bEnable )
			elOK.TriggerClass( 'popup-capability-update-anim');

		elOK.enabled = bEnable;
	};

	var _OnAccept = function( elPanel, funcGetSettingCallback, funcCallbackOnAction )
	{
		if ( m_scheduleHandle )
		{
			$.CancelScheduled( m_scheduleHandle );
			m_scheduleHandle = null;
		}

		elPanel.FindChildInLayoutFile( 'NameableSpinner' ).RemoveClass( 'hidden' );
		elPanel.FindChildInLayoutFile( 'AsyncItemWorkAcceptConfirm' ).AddClass( 'hidden' );
		m_scheduleHandle = $.Schedule( 5, _CancelWaitforCallBack.bind( undefined, elPanel) );

		_PerformAsyncAction( funcGetSettingCallback, funcCallbackOnAction );
	};

	var _ClosePopup = function()
	{
		$.DispatchEvent( 'HideSelectItemForCapabilityPopup' );
		$.DispatchEvent( 'UIPopupButtonClicked', '' );
		$.DispatchEvent( 'CapabilityPopupIsOpen', false );
	};

	var _CancelWaitforCallBack = function( elPanel )
	{
		var elSpinner = elPanel.FindChildInLayoutFile( 'NameableSpinner' );
		elSpinner.AddClass( 'hidden' );
		_ClosePopup();

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

	var _OnEventToClose = function()
	{
		_ResetTimeouthandle();
		_ClosePopup();
	};

	var _ResetTimeouthandle = function()
	{
		if ( m_scheduleHandle )
		{
			$.CancelScheduled( m_scheduleHandle );
			m_scheduleHandle = null;
		}
	};

	var _OnItemCustomization = function( numericType, type, itemid )
	{
		if ( _IgnoreClose() )
		{
			_ResetTimeouthandle();
			return;
		}

		_OnEventToClose();
		$.DispatchEvent( 'ShowAcknowledgePopup', type, itemid );
	};

	var _IgnoreClose = function()
	{
		return m_worktype === 'decodeable';
	};

	var _OnMyPersonaInventoryUpdated = function()
	{
		_OnEventToClose();
	};

	var _OnInventoryPrestigeCoinResponse = function( defidx, upgradeid, hours, prestigetime )
	{
		_OnEventToClose();

		if ( m_worktype === 'prestigecheck' )
		{
			UiToolkitAPI.ShowCustomLayoutPopupParameters(
				'',
				'file://{resources}/layout/popups/popup_inventory_inspect.xml',
				'itemid=' + InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( defidx, 0 ) +                                                                                          
				'&' + 'asyncworkitemwarning=no' +
				'&' + 'asyncworktype='+( ( upgradeid === '0' ) ? 'prestigeget' : 'prestigeupgrade')
			);
		}
		else if ( upgradeid !== '0' )
		{
			InventoryAPI.AcknowledgeNewItembyItemID( upgradeid );
			InventoryAPI.SetItemSessionPropertyValue( upgradeid, 'recent', '1' );
			$.DispatchEvent( 'InventoryItemPreview', upgradeid );
		}
	};

	return {
		Init: _Init,
		OnItemCustomization: _OnItemCustomization,
		OnMyPersonaInventoryUpdated : _OnMyPersonaInventoryUpdated,
		OnInventoryPrestigeCoinResponse: _OnInventoryPrestigeCoinResponse,
		ClosePopup: _ClosePopup,
		OnEventToClose : _OnEventToClose,
		DoAsyncAction: _OnAccept,
		EnableDisableOkBtn : _EnableDisableOkBtn
	};
} )();