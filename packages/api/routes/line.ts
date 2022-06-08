import { JwtClaims, authCheck } from '../middleware/auth';
import { Line, LineMember, LineMemberState } from '@nirvana/core/models/line.model';
import express, { Application, Request, Response } from 'express';

import Content from '@nirvana/core/models/content.model';
import CreateLineRequest from '@nirvana/core/requests/createLine.request';
import GetConversationDetailsResponse from '@nirvana/core/responses/getConversationDetails.response';
import GetDmConversationByOtherUserIdResponse from '@nirvana/core/responses/getDmConversationByOtherUserId.response';
import GetUserLinesResponse from '@nirvana/core/responses/getUserLines.response';
import { LineService } from '../services/line.service';
import MasterLineData from '@nirvana/core/models/masterLineData.model';
import NirvanaResponse from '@nirvana/core/responses/nirvanaResponse';
import { ObjectId } from 'mongodb';
import Relationship from '@nirvana/core/models/relationship.model';
import { User } from '@nirvana/core/models/user.model';
import { UserService } from '../services/user.service';
import { collections } from '../services/database.service';
import UpdateLineMemberState from '@nirvana/core/requests/updateLineMemberState.request';

export default function getLineRoutes() {
  const router = express.Router();

  router.use(express.json());

  // get data for a one on one conversation
  // router.get("/:otherUserGoogleUserId", authCheck, getConversationDetails);

  // create a line
  router.post('/', authCheck, createLine);

  // get all of user's lines
  router.get('/', authCheck, getUserLines);

  // toggle tune into a line
  router.post('/:lineId/state', authCheck, updateLineMemberState);

  // get conversation between user and other user
  router.get('/dm/:otherUserId', authCheck, getDmByOtherUserId);

  return router;
}

async function getDmByOtherUserId(req: Request, res: Response) {
  try {
    const { otherUserId } = req.params;
    const userInfo = res.locals.userInfo as JwtClaims;

    console.log(otherUserId);

    // check db for lines between me and this other person
    // if there is one, then return it with 200 status
    // else return it with custom status that frontend will read

    res.status(200).json();
    return;

    res.status(205).json('no such conversation between you two');
  } catch (error) {
    res.status(500).json(error);
  }
}

async function createLine(req: Request, res: Response) {
  try {
    const reqObj: CreateLineRequest = req.body as CreateLineRequest;
    console.log(req.body);

    if (!reqObj?.otherMemberIds.length) {
      res.status(400).json('must provide member Ids');
      return;
    }

    const userInfo = res.locals.userInfo as JwtClaims;

    const newLine = new Line(
      new ObjectId(userInfo.userId),
      reqObj.lineName ?? undefined,
      new Date(),
      new Date(),
      new ObjectId(),
    );

    // TODO: validate that users exists before creating line members
    const lineMembers: LineMember[] =
      reqObj.otherMemberIds.map((memId) => {
        const newLineMember = new LineMember(
          newLine._id!,
          new ObjectId(memId),
          LineMemberState.INBOX,
        );

        return newLineMember;
      }) ?? [];

    lineMembers.push(
      new LineMember(newLine._id!, new ObjectId(userInfo.userId), LineMemberState.INBOX),
    );

    const transactionResult = await LineService.createLine(newLine, lineMembers);

    transactionResult
      ? res.status(200).json(new NirvanaResponse(newLine))
      : res.status(400).json(new NirvanaResponse(undefined, new Error('unable to create line')));
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

async function updateLineMemberState(req: Request, res: Response) {
  try {
    const userInfo = res.locals.userInfo as JwtClaims;
    const { lineId } = req.params;
    const request = req.body as UpdateLineMemberState;

    // TODO: validation to check if user is actually a member of the line

    const result = await LineService.updateLineMemberState(
      lineId,
      userInfo.userId,
      request.newState,
    );

    return result?.ok
      ? res.status(200).json(new NirvanaResponse("successfully updated line member's state"))
      : res
          .status(400)
          .json(new NirvanaResponse(undefined, new Error('not updated...something went wrong')));
  } catch (error) {
    res.status(500).json(new NirvanaResponse(undefined, error as Error));
  }
}

async function getUserLines(req: Request, res: Response) {
  try {
    const userInfo = res.locals.userInfo as JwtClaims;

    // get all of user's lineMember entries
    const userLineMembers = await LineService.getLineMembersByUserId(userInfo.userId);

    if (!userLineMembers?.length) {
      const resObj = new GetUserLinesResponse([]);

      res.json(new NirvanaResponse(resObj, undefined, 'this user is not in any lines'));

      return;
    }

    const lineIds = userLineMembers?.map((lineMember) => lineMember.lineId) ?? [];

    // this will include the current user lineMember association to the line
    const allLineMembers = await LineService.getLineMembersInLines(lineIds);

    const allLinesUsersIds: ObjectId[] = [];
    allLineMembers?.map((currentLineMember) => {
      if (currentLineMember?.userId) allLinesUsersIds.push(currentLineMember.userId);
    }) ?? [];

    // get all users relevant here
    const allRelevantUsers = await UserService.getUsersByIds(allLinesUsersIds);

    // get all lines from the list of relevant lines
    const lines = (await LineService.getLinesByIds(lineIds)) ?? [];

    const masterLines: MasterLineData[] = [];

    // TODO: get the latest audio blocks for this line...maybe like today and yesterday or by block count

    lines.map((currentLine) => {
      let associatedLineMembersForLine: LineMember[] = [];

      // get all of the line members for this Line
      // make sure that we don't add line member if it's the current user
      allLineMembers?.map((lineMember) => {
        if (currentLine._id) {
          if (lineMember.lineId.equals(currentLine._id))
            associatedLineMembersForLine.push(lineMember);
        }
      }) ?? [];

      // get the user lineMember assoc out of the list of the lineMembers for this line
      const userLineMember = associatedLineMembersForLine?.find(
        (currentLineMemberForLine) =>
          currentLineMemberForLine.userId.toString() === userInfo.userId,
      );

      if (userLineMember) {
        // take out the current user from the "other" line members list now

        associatedLineMembersForLine = associatedLineMembersForLine.filter(
          (currentLineMember) => currentLineMember.userId.toString() !== userInfo.userId,
        );

        // get the user objects for all of the other members
        const otherUsers: User[] = [];
        associatedLineMembersForLine.forEach((currentLineMember) => {
          const foundUserObject = allRelevantUsers?.find((currentUser) =>
            currentUser._id?.equals(currentLineMember.userId),
          );

          if (foundUserObject) otherUsers.push(foundUserObject);
        });

        masterLines.push(
          new MasterLineData(currentLine, userLineMember, associatedLineMembersForLine, otherUsers),
        );
      }
    });

    const resObj = new GetUserLinesResponse(masterLines);

    res.json(new NirvanaResponse<GetUserLinesResponse>(resObj));
  } catch (error) {
    res.status(500).json(error);
  }
}
