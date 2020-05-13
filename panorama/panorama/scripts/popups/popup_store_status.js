"use strict";

var _strStoreStatusOkCmd = null;

var SetupPopup = function()
{
    var ctx = $.GetContextPanel();

    var strMsg = $.UrlDecode( ctx.GetAttributeString('text', '') );
    var strClose = $.UrlDecode( ctx.GetAttributeString('close', '0') );
    var strCancel = $.UrlDecode( ctx.GetAttributeString('cancel', '0') );
    _strStoreStatusOkCmd = $.UrlDecode( ctx.GetAttributeString('cmd', '') );

    ctx.SetDialogVariable("message", $.Localize(strMsg));
    
    var bClose = !!parseInt(strClose);
    var bCancel = !!parseInt(strCancel);

                                                                        

    if (!bClose && !bCancel)
    {
                           
        $('#CancelButton').visible = false;
    }

    if (bCancel)
    {
                       
        $('#OkButton').visible = false;
    }
    
    if (bCancel && !bClose)
    {
                          
        $("#Spinner").AddClass("SpinnerVisible");
    }
};

function OnOKPressed()
{
    if(_strStoreStatusOkCmd)
    {
        GameInterfaceAPI.ConsoleCommand(_strStoreStatusOkCmd);
    }
    _strStoreStatusOkCmd = null;

                  
    $.DispatchEvent( 'UIPopupButtonClicked', '' );
}
