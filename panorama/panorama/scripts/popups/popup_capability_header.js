'use strict';

var CapabiityHeader = ( function()
{
	var m_bShowWarning = true;                                            
	var m_strWarningText = '';                                                   
	var m_worktype = '';                                                                             
	var m_storeItemid = '';
	var m_itemid = '';                             
	var m_ToolId = '';
	
	var _Init = function( elPanel, itemId, funcGetSettingCallback )
	{
		m_itemid = itemId;
		m_worktype = funcGetSettingCallback( "asyncworktype", "" );
		m_storeItemid = funcGetSettingCallback( "storeitemid", "" );
		m_ToolId = funcGetSettingCallback( "toolid", "" );

		                                                                              
		if ( !m_worktype && !m_storeItemid )
			return;
		
		m_bShowWarning = ( funcGetSettingCallback( "asyncworkitemwarning", "yes" ) === 'no' ) ? false : true;
		m_strWarningText = funcGetSettingCallback( "asyncworkitemwarningtext", '' );
		                                                                     

		elPanel.RemoveClass( 'hidden' );
		_SetDialogVariables( elPanel, itemId );
		_SetUpHeaders( elPanel );
	};
	
	var _SetDialogVariables = function( elPanel, itemId )
	{
		elPanel.SetDialogVariable( "itemname", ItemInfo.GetName( itemId ) );
	};
	
	var _SetUpHeaders = function( elPanel )
	{
		_SetUpTitle( elPanel );
		_SetUpWarning( elPanel );
		_SetUpDesc( elPanel );
	};

	var _SetUpTitle = function( elPanel )
	{
		var elTitle = elPanel.FindChildInLayoutFile( 'CapabilityTitle' );
		m_worktype = m_storeItemid ? 'purchase' : m_worktype;
		
		                                                       
		if( !m_ToolId && m_worktype === 'decodeable' )
		{
		    elTitle.text = '#popup_totool_' + m_worktype + '_header';
		}
		else
		{
		    elTitle.text = '#popup_' + m_worktype + '_title';
		}
	};

	var _SetUpWarning = function( elPanel )
	{
		var elWarn = elPanel.FindChildInLayoutFile( 'CapabilityWarning' );

		var sWarnLocString = '';
		if ( m_bShowWarning )
		{	                                      
			sWarnLocString = '#popup_'+m_worktype+'_warning';
		}

		if ( m_worktype === 'decodeable' )
		{
			var sRestriction = InventoryAPI.GetDecodeableRestriction( m_itemid );
			if ( sRestriction !== undefined && sRestriction !== null && sRestriction !== '' )
			{	                                                               
			    sWarnLocString = '#popup_' + m_worktype + '_err_' + sRestriction;
				elWarn.AddClass( 'popup-capability__error' );
			}
		}

		                                          
		if ( m_strWarningText )
		{
			                                                                                  
			sWarnLocString = m_strWarningText;
		}

		elWarn.SetHasClass( 'hidden', sWarnLocString ? false : true );

		if ( sWarnLocString )
		{
			var elWarnLabel = elWarn.FindChildInLayoutFile( 'CapabilityWarningLabel' );
			elWarnLabel.text = sWarnLocString;
		}
	};

	var _SetUpDesc = function ( elPanel)
	{
	    elPanel.FindChildInLayoutFile( 'CapabilityDesc' ).text = '#popup_' + m_worktype + '_desc';
	};

	return {
		Init : _Init
	};
} )();