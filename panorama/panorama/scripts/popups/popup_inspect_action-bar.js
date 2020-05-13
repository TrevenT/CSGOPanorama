'use strict';

var InspectActionBar = ( function (){

	var m_modelImagePanel = null;
	var m_itemId = '';
	var m_callbackHandle = -1;

	                                
	var m_showCert = true;
	var m_showEquip = true;
	var m_showSave = true;
	var m_showMaketLink = false;

	var m_previewingMusic = false;
	
	var _Init = function( elPanel, itemId, funcGetSettingCallback, funcGetSettingCallbackInt, elItemModelImagePanel )
	{
		if ( funcGetSettingCallback( 'inspectonly', 'false' ) === 'false' )
			return;
		
		elPanel.RemoveClass( 'hidden' );
		
		m_modelImagePanel = elItemModelImagePanel;
		m_itemId = itemId;
		m_callbackHandle = funcGetSettingCallbackInt( 'callback', -1 );
		m_showCert = ( funcGetSettingCallback( 'showitemcert', 'true' ) === 'false' );
		m_showEquip = ( funcGetSettingCallback( 'showequip', 'true' ) === 'false' );
		m_showSave = ( funcGetSettingCallback( 'allowsave', 'true' ) === 'true' );
		m_showMaketLink = ( funcGetSettingCallback( 'showmarketlink', 'false' ) === 'true' );
		
		_SetUpItemCertificate( elPanel, itemId );
		_SetupEquipItemBtns( elPanel, itemId );
		_ShowWeaponAndCharacterModelBtns( elPanel, itemId );
		_ShowSaveCharBtn( elPanel );
		_SetCloseBtnAction( elPanel );
		_SetUpMarketLink( elPanel, itemId );

		var slot = ItemInfo.GetSlot( itemId );
		if ( slot == "musickit" )
		{
			InventoryAPI.PlayItemPreviewMusic( null, itemId );
			m_previewingMusic = true;
		}
	};

	var _SetUpItemCertificate = function ( elPanel, id, funcGetSettingCallback )
	{
		var elCert = elPanel.FindChildInLayoutFile( 'InspectItemCert' );
		var certData = InventoryAPI.GetItemCertificateInfo( id );

		if( !certData || m_showCert )
		{
			elCert.visible = false;
			return;
		}

		var aCertData = certData.split("\n"); 
		var strLine = "";
	
		for ( var i = 0; i < aCertData.length -1; i++ )
		{
			if( i % 2 == 0 )
			{
				strLine = strLine + "<b>" + aCertData[i] + "</b>" + ": " + aCertData[i + 1] + "<br><br>";
			}
		}

		elCert.visible = true;
		elCert.SetPanelEvent( 'onmouseover', function (){
			UiToolkitAPI.ShowTextTooltip('InspectItemCert', strLine);
		});

		elCert.SetPanelEvent( 'onmouseout', function (){
			UiToolkitAPI.HideTextTooltip();
		});
	};

	var _SetUpMarketLink = function( elPanel, id )
	{
		var elMarketLinkBtn = elPanel.FindChildInLayoutFile( 'InspectMarketLink' );

		elMarketLinkBtn.SetHasClass( 'hidden', !m_showMaketLink );

		if ( !m_showMaketLink )
		{
			return;
		}

		elMarketLinkBtn.SetPanelEvent( 'onmouseover', function (){
			UiToolkitAPI.ShowTextTooltip('InspectMarketLink', '#SFUI_Store_Market_Link');
		});

		elMarketLinkBtn.SetPanelEvent( 'onmouseout', function (){
			UiToolkitAPI.HideTextTooltip();
		});

		elMarketLinkBtn.SetPanelEvent( 'onactivate', function() {
			SteamOverlayAPI.OpenURL( ItemInfo.GetMarketLinkForLootlistItem( id ));
			StoreAPI.RecordUIEvent( "ViewOnMarket" );
		});
	};

	var _SetupEquipItemBtns = function ( elPanel, id )
	{
		var elMoreActionsBtn = elPanel.FindChildInLayoutFile( 'InspectActionsButton' );
		var elSingleActionBtn = elPanel.FindChildInLayoutFile( 'SingleAction' );
		
		if ( m_showEquip )
		{
			elMoreActionsBtn.AddClass( 'hidden' );
			elSingleActionBtn.AddClass( 'hidden' );
			return;
		}

		var isSticker = ItemInfo.ItemMatchDefName( id, 'sticker' );
		var isEquipped = ( ItemInfo.IsEquippedForT( id ) || ItemInfo.IsEquippedForCT( id ) || ItemInfo.IsEquippedForNoTeam( id ) ) ? true : false;
		
		                                                 
		if ( ItemInfo.IsEquippalbleButNotAWeapon( id ) ||
			isSticker ||
			ItemInfo.IsSpraySealed( id ) ||
			isEquipped )
		{
			elMoreActionsBtn.AddClass( 'hidden' );

			if ( !isEquipped  )
			{
				elSingleActionBtn.RemoveClass( 'hidden' );
				_SetUpSingleActionBtn( elPanel, id, ( isSticker || ItemInfo.IsSpraySealed( id )) );
			}

			return;
		}
		else
		{
			elMoreActionsBtn.RemoveClass( 'hidden' );
			elSingleActionBtn.AddClass( 'hidden' );
		}
	};

	var _SetUpSingleActionBtn = function( elPanel, id, isSticker )
	{
		var validEntries = ItemContextEntires.FilterEntries( 'inspect' );
		var elSingleActionBtn = elPanel.FindChildInLayoutFile( 'SingleAction' );

		for( var i = 0; i < validEntries.length; i++ )
		{
			var entry = validEntries[ i ];
			
			if ( entry.AvailableForItem( id ) )
			{
				var closeInspect = isSticker ? true : false;
				elSingleActionBtn.text = '#inv_context_' + entry.name;
				elSingleActionBtn.SetPanelEvent( 'onactivate', _OnSingleAction.bind( this, entry, id, closeInspect ) );
			}
		}
	};

	var _OnSingleAction= function( entry, id, closeInspect )
	{
		if ( closeInspect )
		{
			_CloseBtnAction();
		}
		
		entry.OnSelected( id );
	};

	                                                                                                    
	                            
	                                                                                                    
	var _ShowWeaponAndCharacterModelBtns = function ( elPanel, id )
	{
		if( !ItemInfo.IsEquippalbleButNotAWeapon( id ) && !ItemInfo.ItemMatchDefName(id, 'sticker' ) && !ItemInfo.IsSpraySealed( id ))
		{
			var list = _GetValidCharacterModels( id );
			var hasAnims = CharacterAnims.ItemHasCharacterAnims(
							list[0].team,
							ItemInfo.GetSlotSubPosition(id),
							ItemInfo.GetItemDefinitionName(id),
							id
						);
			
			elPanel.FindChildInLayoutFile( 'InspectCharBtn' ).SetHasClass( 'hidden', !hasAnims );
			elPanel.FindChildInLayoutFile( 'InspectWeaponBtn' ).SetHasClass( 'hidden', !hasAnims );

			if ( hasAnims )
			{
				_SetDropdown( elPanel, list, id );
			}
		}
	};

	var _GetValidCharacterModels = function ( id )
	{
		return CharacterAnims.GetValidCharacterModels().filter(function (entry) {
			return (ItemInfo.IsItemCt(id) && entry.team === 'ct') ||
				(ItemInfo.IsItemT(id) && entry.team === 't') ||
				ItemInfo.IsItemAnyTeam(id);
		});
	};

	var _SetDropdown = function( elPanel, vaildEntiresList, id )
	{
		var elDropdown = elPanel.FindChildInLayoutFile( 'InspectDropdownCharModels' );

		vaildEntiresList.forEach( function ( entry ){
			var elDropdown = elPanel.FindChildInLayoutFile( 'InspectDropdownCharModels' );
			var newEntry = $.CreatePanel( 'Label', elDropdown, entry.model, {
				class: 'DropDownMenu',
				html: 'true'
			});
	
			newEntry.SetAttributeString( 'data-team', entry.team );
			newEntry.text = $.Localize( entry.label );
			elDropdown.AddOption( newEntry );

		});

		elDropdown.SetPanelEvent( 'oninputsubmit', InspectActionBar.OnUpdateCharModel.bind( undefined, false, elDropdown, id ));
		elDropdown.SetSelected( vaildEntiresList[0].model );
		elDropdown.SetPanelEvent( 'oninputsubmit', InspectActionBar.OnUpdateCharModel.bind( undefined, true, elDropdown, id ));
	};

	var _OnUpdateCharModel = function ( bPlaySound, elDropdown, itemId )
	{
		var modelPath = elDropdown.GetSelected().id;
		var team = elDropdown.GetSelected().GetAttributeString( 'data-team', '(not found)');

		InspectModelImage.SetCharScene( m_modelImagePanel, itemId, modelPath, team );
		
		if( bPlaySound ) {

			                                                                             
			                                                                                  
			var soundName = modelPath;
			for(var i = soundName.length-1; i > 0; --i) {
				if(soundName[i] == '/' || soundName[i] == '\\') {
					soundName = soundName.substring(i+1);
					break;
				}
			}

			if(soundName.substring(soundName.length-4) == ".mdl") {
				soundName = soundName.substring(0, soundName.length-4);
				$.DispatchEvent( "PlaySoundEffect", "weapon_select_char_" + soundName, "MOUSE" );
			}
		}
	};

	var _ShowSaveCharBtn = function( elPanel )
	{
		var elBtn = elPanel.FindChildInLayoutFile( 'PopupInspectSaveModel' );
		elBtn.visible = m_showSave;
	};

	//--------------------------------------------------------------------------------------------------
	// Actions from button presses
	//--------------------------------------------------------------------------------------------------
	var _NavigateModelPanel = function ( type )
	{ 
		InspectModelImage.ShowHideItemPanel( m_modelImagePanel, ( type !== 'InspectModelChar' ) );
		InspectModelImage.ShowHideCharPanel( m_modelImagePanel, ( type === 'InspectModelChar' ));

		$.GetContextPanel().FindChildTraverse( 'InspectCharModelsControls' ).SetHasClass( 'hidden', type !== 'InspectModelChar' );
	};

	var _SaveCharacterModelForVanity = function ()
	{
		$.DispatchEvent( "PlaySoundEffect", "weapon_selectDashboard", "MOUSE" );

		var model = $.GetContextPanel().FindChildTraverse( 'InspectDropdownCharModels' ).GetSelected().id;

		if( model !== '' )
		{
			                                                      
			CharacterAnims.SaveModelPanelSettingsToConvars();
			$.DispatchEvent( 'UpdateVanityModelData' );
		}
	};

	var _ShowContextMenu = function ()
	{
		var elBtn = $.GetContextPanel().FindChildTraverse( 'InspectActionsButton' );
		var id = m_itemId;
		                                         

		var contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent(
			elBtn.id,
			'',
			'file://{resources}/layout/context_menus/context_menu_inventory_item.xml',
			'itemid='+id+'&populatefiltertext=inspect',
			function () 
			{
				$.DispatchEvent( "PlaySoundEffect", "weapon_selectReplace", "MOUSE" );
			}
		);
		contextMenuPanel.AddClass( "ContextMenu_NoArrow" );
	};

	var _SetCloseBtnAction = function( elPanel )
	{
		var elBtn = elPanel.FindChildInLayoutFile( 'InspectCloseBtn' );
		elBtn.SetPanelEvent( 'onactivate', _CloseBtnAction );
	};

	var _CloseBtnAction = function ( )
	{
		$.DispatchEvent( "PlaySoundEffect", "inventory_inspect_close", "MOUSE" );

		if ( m_modelImagePanel.IsValid() )
		{
			InspectModelImage.CancelCharAnim( m_modelImagePanel );
		}

		                                                      
		$.DispatchEvent( 'UIPopupButtonClicked', '' );

		var callbackFunc = m_callbackHandle;
		if ( callbackFunc != -1 )
		{
			UiToolkitAPI.InvokeJSCallback( callbackFunc );
		}

		if ( m_previewingMusic )
		{
			InventoryAPI.StopItemPreviewMusic();
			m_previewingMusic = false;
		}
	};

	return{
		Init						: _Init,
		SaveCharacterModelForVanity	: _SaveCharacterModelForVanity,
		ShowContextMenu: _ShowContextMenu,
		CloseBtnAction: _CloseBtnAction,
		NavigateModelPanel: _NavigateModelPanel,
		OnUpdateCharModel: _OnUpdateCharModel
	};
} )();

( function()
{
} )();
